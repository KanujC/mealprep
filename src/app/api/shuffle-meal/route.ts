import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getValidSwap } from "@/lib/meal-generator";
import { formatDate, getWeekDates } from "@/lib/utils";
import { Dish, MealType, Member } from "@/lib/types";

async function applyDishToMeal(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  mealId: string,
  dish: Dish,
  kanuj: Member,
  anshia: Member,
  clearLeftover = false,
) {
  await supabase
    .from("meals")
    .update({ dish_id: dish.id, ...(clearLeftover ? { is_leftover_of: null } : {}) })
    .eq("id", mealId);
  const [kanujMM, anshiaMM] = await Promise.all([
    supabase.from("meal_members").select("id").eq("meal_id", mealId).eq("member_id", kanuj.id).single(),
    supabase.from("meal_members").select("id").eq("meal_id", mealId).eq("member_id", anshia.id).single(),
  ]);
  if (kanujMM.data)
    await supabase.from("meal_members").update({ calories: dish.base_calories_kanuj || null, includes_chicken: dish.allows_chicken_addon, is_paneer_swap: false }).eq("id", kanujMM.data.id);
  if (anshiaMM.data)
    await supabase.from("meal_members").update({ calories: dish.base_calories_anshia || null, includes_chicken: false, is_paneer_swap: dish.paneer_swap }).eq("id", anshiaMM.data.id);
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const { mealId, date, mealType } = await req.json();
  const [membersRes, dishesRes, weekMealsRes, mealRes] = await Promise.all([
    supabase.from("members").select("*"),
    supabase.from("dishes").select("*"),
    supabase.from("meals").select("dish_id, meal_type").gte("date", formatDate(getWeekDates(new Date(date))[0])).lte("date", formatDate(getWeekDates(new Date(date))[6])),
    supabase.from("meals").select("dish_id").eq("id", mealId).single(),
  ]);
  if (membersRes.error || dishesRes.error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  const members: Member[] = membersRes.data;
  const dishes: Dish[] = dishesRes.data;
  const anshia = members.find((m) => m.name === "Anshia")!;
  const kanuj = members.find((m) => m.name === "Kanuj")!;
  const newDish = getValidSwap(mealRes.data?.dish_id ?? null, mealType as MealType, new Date(date), dishes, weekMealsRes.data ?? [], false);
  if (!newDish) return NextResponse.json({ error: "No valid swap found" }, { status: 404 });

  await applyDishToMeal(supabase, mealId, newDish, kanuj, anshia, true);

  const todayStr = formatDate(new Date());

  // When shuffling dinner: sync next day's leftover lunch (if it references this dinner)
  if (mealType === "dinner") {
    const nextDay = addDays(date, 1);
    const nextLunch = await supabase
      .from("meals")
      .select("id")
      .eq("date", nextDay)
      .eq("meal_type", "lunch")
      .eq("is_leftover_of", mealId)
      .maybeSingle();
    if (nextLunch.data) {
      await applyDishToMeal(supabase, nextLunch.data.id, newDish, kanuj, anshia);
    }
  }

  // When shuffling lunch that is itself a leftover: sync the source dinner (only if source day >= today)
  if (mealType === "lunch") {
    const thisMeal = await supabase.from("meals").select("is_leftover_of").eq("id", mealId).single();
    const sourceDinnerId = thisMeal.data?.is_leftover_of;
    if (sourceDinnerId) {
      const sourceDinner = await supabase.from("meals").select("id, date").eq("id", sourceDinnerId).single();
      if (sourceDinner.data && sourceDinner.data.date >= todayStr) {
        await applyDishToMeal(supabase, sourceDinner.data.id, newDish, kanuj, anshia, true);
      }
    }
  }

  return NextResponse.json({ ok: true, newDish: newDish.name });
}
