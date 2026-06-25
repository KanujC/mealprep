/**
 * Seed script — run with:
 *   npx tsx scripts/seed.ts
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// ─── Members ────────────────────────────────────────────────────────────────

const MEMBERS = [
  { name: "Kanuj", calorie_target: 1900 },
  { name: "Anshia", calorie_target: 1500 },
];

// ─── Dish Library ────────────────────────────────────────────────────────────
// base_calories are per portion — rough Indian serving estimates

const DISHES = [
  // Breakfast
  {
    name: "Oats & Protein",
    category: "breakfast",
    is_veg: true,
    is_easy: true,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "none",
    base_calories_kanuj: 380,
    base_calories_anshia: 300,
  },
  {
    name: "Brötchen with Hummus",
    category: "breakfast",
    is_veg: true,
    is_easy: true,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "none",
    base_calories_kanuj: 350,
    base_calories_anshia: 320,
  },
  {
    name: "Cereal with Protein Milk",
    category: "breakfast",
    is_veg: true,
    is_easy: true,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "none",
    base_calories_kanuj: 340,
    base_calories_anshia: 310,
  },
  {
    name: "Cheela",
    category: "breakfast",
    is_veg: true,
    is_easy: false,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "none",
    base_calories_kanuj: 420,
    base_calories_anshia: 360,
  },
  {
    name: "Sandwich",
    category: "breakfast",
    is_veg: true,
    is_easy: false,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "none",
    base_calories_kanuj: 380,
    base_calories_anshia: 330,
  },
  {
    name: "Idli",
    category: "breakfast",
    is_veg: true,
    is_easy: false,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "none",
    base_calories_kanuj: 360,
    base_calories_anshia: 300,
  },

  // Snack
  {
    name: "Fruit",
    category: "snack",
    is_veg: true,
    is_easy: true,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "none",
    base_calories_kanuj: 120,
    base_calories_anshia: 100,
  },

  // Dinner / Lunch pool
  {
    name: "Chole",
    category: "dinner",
    is_veg: true,
    is_easy: true,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "roti",
    base_calories_kanuj: 500,
    base_calories_anshia: 420,
  },
  {
    name: "Rajma",
    category: "dinner",
    is_veg: true,
    is_easy: false,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "roti",
    base_calories_kanuj: 520,
    base_calories_anshia: 440,
  },
  {
    name: "Pasta",
    category: "dinner",
    is_veg: true,
    is_easy: true,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "none",
    base_calories_kanuj: 560,
    base_calories_anshia: 470,
  },
  {
    name: "Salad",
    category: "dinner",
    is_veg: true,
    is_easy: true,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "none",
    base_calories_kanuj: 280,
    base_calories_anshia: 250,
  },
  {
    name: "Daal",
    category: "dinner",
    is_veg: true,
    is_easy: true,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "roti",
    base_calories_kanuj: 480,
    base_calories_anshia: 400,
  },
  {
    name: "Khichdi",
    category: "dinner",
    is_veg: true,
    is_easy: true,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "none",
    base_calories_kanuj: 500,
    base_calories_anshia: 420,
  },
  {
    name: "Sambhar",
    category: "dinner",
    is_veg: true,
    is_easy: false,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "roti",
    base_calories_kanuj: 460,
    base_calories_anshia: 380,
  },
  {
    name: "Paneer Bhurji",
    category: "dinner",
    is_veg: true,
    is_easy: false,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "roti",
    base_calories_kanuj: 520,
    base_calories_anshia: 450,
  },
  {
    name: "Chicken Curry",
    category: "dinner",
    is_veg: false,
    is_easy: false,
    allows_chicken_addon: true,
    paneer_swap: true,
    serve_with: "roti",
    base_calories_kanuj: 580,
    base_calories_anshia: 480, // paneer version
  },
  {
    name: "Chilli Soya",
    category: "dinner",
    is_veg: true,
    is_easy: false,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "wrap",
    base_calories_kanuj: 510,
    base_calories_anshia: 430,
  },
  {
    name: "Wraps",
    category: "dinner",
    is_veg: true,
    is_easy: false,
    allows_chicken_addon: false,
    paneer_swap: false,
    serve_with: "wrap",
    base_calories_kanuj: 490,
    base_calories_anshia: 410,
  },
];

// ─── Generate one sample week ─────────────────────────────────────────────────

function getWeekDates(anchor: Date): Date[] {
  const d = new Date(anchor);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    return dd;
  });
}

function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}

function isWeekend(d: Date) {
  return d.getDay() === 0 || d.getDay() === 6;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("🌱 Seeding Supabase...");

  // ── Members ──
  const { error: mErr } = await supabase
    .from("members")
    .upsert(MEMBERS, { onConflict: "name" });
  if (mErr) { console.error("members:", mErr.message); process.exit(1); }
  console.log("✓ Members seeded");

  // ── Dishes ──
  const { error: dErr } = await supabase
    .from("dishes")
    .upsert(DISHES, { onConflict: "name" });
  if (dErr) { console.error("dishes:", dErr.message); process.exit(1); }
  console.log("✓ Dishes seeded");

  // ── Fetch IDs ──
  const { data: members } = await supabase.from("members").select("*");
  const { data: dishes } = await supabase.from("dishes").select("*");
  if (!members || !dishes) { console.error("Could not fetch seeded data"); process.exit(1); }

  const allMembers = members as { id: string; name: string; calorie_target: number }[];
  const allDishes = dishes as { id: string; name: string; base_calories_kanuj: number; base_calories_anshia: number; allows_chicken_addon: boolean; paneer_swap: boolean }[];

  const kanuj = allMembers.find((m) => m.name === "Kanuj")!;
  const anshia = allMembers.find((m) => m.name === "Anshia")!;

  function dish(name: string) {
    return allDishes.find((d) => d.name === name)!;
  }

  // ── Sample week ──
  const weekDates = getWeekDates(new Date());
  const startDate = fmt(weekDates[0]);
  const endDate = fmt(weekDates[6]);

  // Clear existing meals for this week
  await supabase.from("meals").delete().gte("date", startDate).lte("date", endDate);

  // Fixed sample dinner rotation
  const dinnerNames = [
    "Chole",        // Mon
    "Chicken Curry",// Tue
    "Pasta",        // Wed
    "Daal",         // Thu
    "Salad",        // Fri (breaks leftover rule)
    "Rajma",        // Sat
    "Khichdi",      // Sun
  ];

  const weekendBreakfasts = ["Cheela", "Sandwich", "Idli"];
  const anshiaBreakfasts = ["Brötchen with Hummus", "Cereal with Protein Milk"];
  let anshiaBreakfastIdx = 0;
  let weekendBreakfastIdx = 0;

  const mealIds: { date: string; type: string; id: string; dishId: string }[] = [];

  for (let i = 0; i < 7; i++) {
    const date = weekDates[i];
    const dateStr = fmt(date);
    const weekend = isWeekend(date);
    const prevDinnerName = i > 0 ? dinnerNames[i - 1] : null;
    const isSaladDinner = prevDinnerName === "Salad";

    // Breakfast
    let bfDish;
    if (weekend) {
      bfDish = dish(weekendBreakfasts[weekendBreakfastIdx++ % weekendBreakfasts.length]);
    } else {
      if (Math.random() > 0.5 || i === 0) {
        bfDish = dish("Oats & Protein");
      } else {
        bfDish = dish(anshiaBreakfasts[anshiaBreakfastIdx++ % anshiaBreakfasts.length]);
      }
    }

    // Lunch
    let lunchDish;
    let lunchIsLeftover = false;
    if (i === 0 || isSaladDinner) {
      lunchDish = dish(pick(["Chole", "Daal", "Pasta", "Khichdi"]));
    } else {
      lunchDish = dish(dinnerNames[i - 1]);
      lunchIsLeftover = true;
    }

    // Snack
    const snackDish = dish("Fruit");

    // Dinner
    const dinnerDish = dish(dinnerNames[i]);

    for (const [mealType, mealDish, isLeftover] of [
      ["breakfast", bfDish, false],
      ["lunch", lunchDish, lunchIsLeftover],
      ["snack", snackDish, false],
      ["dinner", dinnerDish, false],
    ] as [string, typeof bfDish, boolean][]) {
      const { data: meal, error } = await supabase
        .from("meals")
        .insert({
          date: dateStr,
          meal_type: mealType,
          dish_id: mealDish?.id ?? null,
          eating_out: false,
        })
        .select()
        .single();

      if (error || !meal) {
        console.error(`  meal ${mealType} ${dateStr}:`, error?.message);
        continue;
      }

      mealIds.push({ date: dateStr, type: mealType, id: meal.id, dishId: mealDish?.id ?? "" });

      // Link leftover
      if (isLeftover && i > 0) {
        const prevDinnerEntry = mealIds.find(
          (m) => m.date === fmt(weekDates[i - 1]) && m.type === "dinner"
        );
        if (prevDinnerEntry) {
          await supabase
            .from("meals")
            .update({ is_leftover_of: prevDinnerEntry.id })
            .eq("id", meal.id);
        }
      }

      // Insert meal_members
      const d = mealDish;
      const chickenDinner =
        d?.allows_chicken_addon && mealType === "dinner" && !weekend;
      const chickenLunch =
        d?.allows_chicken_addon && mealType === "lunch" && !weekend && lunchIsLeftover;

      await supabase.from("meal_members").insert([
        {
          meal_id: meal.id,
          member_id: kanuj.id,
          calories: d?.base_calories_kanuj ?? null,
          includes_chicken: chickenDinner || chickenLunch || false,
          is_paneer_swap: false,
        },
        {
          meal_id: meal.id,
          member_id: anshia.id,
          calories: d?.base_calories_anshia ?? null,
          includes_chicken: false,
          is_paneer_swap: d?.paneer_swap ?? false,
        },
      ]);
    }

    console.log(`  ✓ ${dateStr}`);
  }

  console.log("\n✅ Seed complete! Sample week generated.");
  console.log(`   Week: ${startDate} → ${endDate}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
