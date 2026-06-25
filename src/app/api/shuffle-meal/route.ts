import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getValidSwap } from "@/lib/meal-generator";
import { formatDate, getWeekDates } from "@/lib/utils";
import { Dish, MealType, Member } from "@/lib/types";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const { mealId, date, mealType } = await req.json();

  const [membersRes, dishesRes, weekMealsRes, mealRes] = await Promise.all([
    supabase.from("members").select("*"),
    supabase.from("dishes").select("*"),
    supabase
      .from("meals")
      .select("dish_id, meal_type")
      .gte("date", formatDate(getWeekDates(new Date(date))[0]))
      .lte("date", formatDate(getWeekDates(new Date(date))[6])),
    supabase.from("meals").select("dish_id").eq("id", mealId).single(),
  ]);

  if (membersRes.error || dishesRes.error) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const members: Member[] = membersRes.data;
  const dishes: Dish[] = dishesRes.data;
  const anshia = members.find((m) => m.name === "Anshia")!;
  const kanuj = members.find((m) => m.name === "Kanuj")!;

  const newDish = getValidSwap(
    mealRes.data?.dish_id ?? null,
    mealType as MealType,
    new Date(date),
    dishes,
    weekMealsRes.data ?? [],
    false
  );

  if (!newDish) {
    return NextResponse.json({ error: "No valid swap found" }, { status: 404 });
  }

  // Update meal
  await supabase
    .from("meals")
    .update({
      dish_id: newDish.id,
      is_leftover_of: null,
    })
    .eq("id", mealId);

  // Update meal_members calories
  const kanujMM = await supabase
    .from("meal_members")
    .select("id")
    .eq("meal_id", mealId)
    .eq("member_id", kanuj.id)
    .single();
  const anshiaMM = await supabase
    .from("meal_members")
    .select("id")
    .eq("meal_id", mealId)
    .eq("member_id", anshia.id)
    .single();

  if (kanujMM.data) {
    await supabase
      .from("meal_members")
      .update({
        calories: newDish.base_calories_kanuj || null,
        includes_chicken: newDish.allows_chicken_addon,
        is_paneer_swap: false,
      })
      .eq("id", kanujMM.data.id);
  }
  if (anshiaMM.data) {
    await supabase
      .from("meal_members")
      .update({
        calories: newDish.base_calories_anshia || null,
        includes_chicken: false,
        is_paneer_swap: newDish.paneer_swap,
      })
      .eq("id", anshiaMM.data.id);
  }

  return NextResponse.json({ ok: true, newDish: newDish.name });
}
