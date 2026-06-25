import { Dish, MealType } from "./types";
import { formatDate, isWeekend } from "./utils";

interface GeneratedMeal {
  date: string;
  meal_type: MealType;
  dish_id: string | null;
  is_leftover_of_dish_id: string | null;
  eating_out: boolean;
  eating_out_label: string | null;
  kanuj_calories: number;
  anshia_calories: number;
  kanuj_includes_chicken: boolean;
  anshia_is_paneer_swap: boolean;
}

const WEEKEND_BREAKFASTS = ["Cheela", "Sandwich", "Idli"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateWeek(
  weekDates: Date[],
  dishes: Dish[],
  kanujId: string,
  anshiaId: string
): Omit<GeneratedMeal, "kanuj_calories" | "anshia_calories">[] {
  void kanujId;
  void anshiaId;

  const dinnerPool = dishes.filter((d) => d.category === "dinner" || d.category === "lunch");
  const snackPool = dishes.filter((d) => d.category === "snack");
  const breakfastPool = dishes.filter((d) => d.category === "breakfast");
  const results: Omit<GeneratedMeal, "kanuj_calories" | "anshia_calories">[] = [];

  const dinners: (Dish | null)[] = [];
  const nonEasy = shuffle(dinnerPool.filter((d) => !d.is_easy));
  const easy = dinnerPool.filter((d) => d.is_easy);
  let nonEasyIdx = 0;

  for (let i = 0; i < 7; i++) {
    let dish: Dish | null = null;
    if (nonEasyIdx < nonEasy.length && Math.random() > 0.3) {
      dish = nonEasy[nonEasyIdx++];
    } else {
      dish = pickRandom(easy) ?? null;
    }
    dinners.push(dish);
  }

  for (let i = 0; i < 7; i++) {
    const date = weekDates[i];
    const dateStr = formatDate(date);
    const weekend = isWeekend(date);

    let breakfastDish: Dish | null = null;
    if (weekend) {
      const idx = i === 5 ? 0 : 1;
      const name = WEEKEND_BREAKFASTS[idx % WEEKEND_BREAKFASTS.length];
      breakfastDish = breakfastPool.find((d) => d.name === name) ?? breakfastPool[0] ?? null;
    } else {
      breakfastDish = breakfastPool.find((d) => d.name === "Oats & Protein") ?? breakfastPool[0] ?? null;
    }

    results.push({ date: dateStr, meal_type: "breakfast", dish_id: breakfastDish?.id ?? null, is_leftover_of_dish_id: null, eating_out: false, eating_out_label: null, kanuj_includes_chicken: false, anshia_is_paneer_swap: false });

    const prevDinner = i > 0 ? dinners[i - 1] : null;
    const isSaladDinner = prevDinner?.name === "Salad";
    let lunchDish: Dish | null = null;
    let isLeftoverOf: string | null = null;

    if (i === 0) {
      lunchDish = easy.find((d) => d.name !== "Salad") ?? easy[0] ?? null;
    } else if (isSaladDinner) {
      lunchDish = easy.find((d) => d.name !== "Salad" && d.id !== dinners[i]?.id) ?? easy[0] ?? null;
    } else {
      lunchDish = prevDinner;
      isLeftoverOf = prevDinner?.id ?? null;
    }

    const lunchIsChicken = lunchDish?.allows_chicken_addon === true && !isWeekend(date);
    const lunchIsPaneer = lunchDish?.paneer_swap === true;
    results.push({ date: dateStr, meal_type: "lunch", dish_id: lunchDish?.id ?? null, is_leftover_of_dish_id: isLeftoverOf, eating_out: false, eating_out_label: null, kanuj_includes_chicken: lunchIsChicken, anshia_is_paneer_swap: lunchIsPaneer });

    const snackDish = snackPool.length > 0 ? pickRandom(snackPool) : null;
    results.push({ date: dateStr, meal_type: "snack", dish_id: snackDish?.id ?? null, is_leftover_of_dish_id: null, eating_out: false, eating_out_label: null, kanuj_includes_chicken: false, anshia_is_paneer_swap: false });

    const dinner = dinners[i];
    const dinnerIsChicken = dinner?.allows_chicken_addon === true;
    const dinnerIsPaneer = dinner?.paneer_swap === true;
    results.push({ date: dateStr, meal_type: "dinner", dish_id: dinner?.id ?? null, is_leftover_of_dish_id: null, eating_out: false, eating_out_label: null, kanuj_includes_chicken: dinnerIsChicken, anshia_is_paneer_swap: dinnerIsPaneer });
  }
  return results;
}

export function getValidSwap(
  currentDishId: string | null,
  mealType: MealType,
  date: Date,
  dishes: Dish[],
  weekMeals: { dish_id: string | null; meal_type: MealType }[],
  forAnshia: boolean
): Dish | null {
  void date;
  const pool = dishes.filter((d) => {
    if (d.category !== mealType && mealType !== "lunch") return false;
    if (d.category === "breakfast" && mealType !== "breakfast") return false;
    if (d.id === currentDishId) return false;
    if (forAnshia && !d.is_veg) return false;
    if (!d.is_easy) {
      const alreadyUsed = weekMeals.some((m) => m.dish_id === d.id && (m.meal_type === "dinner" || m.meal_type === "lunch"));
      if (alreadyUsed) return false;
    }
    return true;
  });
  return pool.length > 0 ? pickRandom(pool) : null;
}
