import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateWeek } from "@/lib/meal-generator";
import { getWeekDates, formatDate } from "@/lib/utils";
import { Dish, Member } from "@/lib/types";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await req.json().catch(() => ({}));
  const anchorDate = body.anchorDate ? new Date(body.anchorDate) : new Date();
  const weekDates = getWeekDates(anchorDate);
  const startDate = formatDate(weekDates[0]);
  const endDate = formatDate(weekDates[6]);

  const [membersRes, dishesRes] = await Promise.all([
    supabase.from("members").select("*"),
    supabase.from("dishes").select("*"),
  ]);
  if (membersRes.error) return NextResponse.json({ error: membersRes.error.message }, { status: 500 });
  if (dishesRes.error) return NextResponse.json({ error: dishesRes.error.message }, { status: 500 });

  const members: Member[] = membersRes.data;
  const dishes: Dish[] = dishesRes.data;
  const kanuj = members.find((m) => m.name === "Kanuj")!;
  const anshia = members.find((m) => m.name === "Anshia")!;

  // Delete existing meals for the week
  await supabase.from("meals").delete().gte("date", startDate).lte("date", endDate);

  const generatedMeals = generateWeek(weekDates, dishes, kanuj.id, anshia.id);

  // Insert meals
  for (const gm of generatedMeals) {
    const { data: meal, error: mealError } = await supabase
      .from("meals")
      .insert({
        date: gm.date,
        meal_type: gm.meal_type,
        dish_id: gm.dish_id,
        eating_out: gm.eating_out,
        eating_out_label: gm.eating_out_label,
      })
      .select()
      .single();

    if (mealError || !meal) continue;

    // Link is_leftover_of by finding the previous dinner meal
    if (gm.is_leftover_of_dish_id) {
      // find the dinner meal on the previous day with that dish
      const prevDate = new Date(gm.date + "T00:00:00");
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = formatDate(prevDate);
      const { data: prevDinner } = await supabase
        .from("meals")
        .select("id")
        .eq("date", prevDateStr)
        .eq("meal_type", "dinner")
        .eq("dish_id", gm.is_leftover_of_dish_id)
        .single();
      if (prevDinner) {
        await supabase
          .from("meals")
          .update({ is_leftover_of: prevDinner.id })
          .eq("id", meal.id);
      }
    }

    // Insert meal_members for both
    const dish = dishes.find((d) => d.id === gm.dish_id);
    const anshiaDish = gm.anshia_dish_id ? dishes.find((d) => d.id === gm.anshia_dish_id) : dish;
    const kanujCalories = dish?.base_calories_kanuj ?? 0;
    const anshiaCalories = anshiaDish?.base_calories_anshia ?? 0;

    await supabase.from("meal_members").insert([
      {
        meal_id: meal.id,
        member_id: kanuj.id,
        calories: kanujCalories || null,
        includes_chicken: gm.kanuj_includes_chicken,
        is_paneer_swap: false,
      },
      {
        meal_id: meal.id,
        member_id: anshia.id,
        dish_id: gm.anshia_dish_id ?? null,
        calories: anshiaCalories || null,
        includes_chicken: false,
        is_paneer_swap: gm.anshia_is_paneer_swap,
      },
    ]);
  }

  return NextResponse.json({ ok: true, count: generatedMeals.length });
}
