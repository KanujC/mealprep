export type MealType = "breakfast" | "lunch" | "snack" | "dinner";
export type ServeWith = "wrap" | "roti" | "none";
export type Category = "breakfast" | "lunch" | "dinner" | "snack";

export interface Member {
  id: string;
  name: string;
  calorie_target: number;
}

export interface Dish {
  id: string;
  name: string;
  category: Category;
  is_veg: boolean;
  is_easy: boolean;
  allows_chicken_addon: boolean;
  paneer_swap: boolean;
  serve_with: ServeWith | null;
  base_calories_kanuj: number;
  base_calories_anshia: number;
}

export interface Meal {
  id: string;
  date: string;
  meal_type: MealType;
  dish_id: string | null;
  is_leftover_of: string | null;
  eating_out: boolean;
  eating_out_label: string | null;
}

export interface MealMember {
  id: string;
  meal_id: string;
  member_id: string;
  dish_id?: string | null; // member-specific dish override (e.g. Anshia's breakfast)
  calories: number | null;
  includes_chicken: boolean;
  is_paneer_swap: boolean;
}

export interface Extra {
  id: string;
  date: string;
  member_id: string;
  name: string;
  calories: number;
}

// Enriched types for UI
export interface MealWithDish extends Meal {
  dish?: Dish;
  meal_members: (MealMember & { member: Member; member_dish?: Dish })[];
}

export interface DayPlan {
  date: string;
  meals: MealWithDish[];
}

export const CHICKEN_ADDON_KCAL = 165;
export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

export const QUICK_EXTRAS = [
  { name: "Nuts (30g)", calories: 180 },
  { name: "Skyr (150g)", calories: 90 },
  { name: "Protein dessert", calories: 130 },
  { name: "Air-fried snack", calories: 200 },
];
