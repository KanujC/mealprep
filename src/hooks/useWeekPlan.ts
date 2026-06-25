"use client";
import * as React from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Dish, Extra, Meal, MealMember, Member, MealWithDish } from "@/lib/types";
import { formatDate, getWeekDates } from "@/lib/utils";

export interface WeekPlanData {
  members: Member[];
  dishes: Dish[];
  meals: MealWithDish[];
  extras: Extra[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWeekPlan(anchorDate: Date = new Date()): WeekPlanData {
  const weekDates = getWeekDates(anchorDate);
  const startDate = formatDate(weekDates[0]);
  const endDate = formatDate(weekDates[6]);

  const [members, setMembers] = React.useState<Member[]>([]);
  const [dishes, setDishes] = React.useState<Dish[]>([]);
  const [meals, setMeals] = React.useState<MealWithDish[]>([]);
  const [extras, setExtras] = React.useState<Extra[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [membersRes, dishesRes, mealsRes, mmRes, extrasRes] =
        await Promise.all([
          supabase.from("members").select("*").order("name"),
          supabase.from("dishes").select("*").order("name"),
          supabase
            .from("meals")
            .select("*")
            .gte("date", startDate)
            .lte("date", endDate)
            .order("date")
            .order("meal_type"),
          supabase
            .from("meal_members")
            .select("*"),
          supabase
            .from("extras")
            .select("*")
            .gte("date", startDate)
            .lte("date", endDate),
        ]);

      if (membersRes.error) throw membersRes.error;
      if (dishesRes.error) throw dishesRes.error;
      if (mealsRes.error) throw mealsRes.error;
      if (mmRes.error) throw mmRes.error;
      if (extrasRes.error) throw extrasRes.error;

      const membersData: Member[] = membersRes.data ?? [];
      const dishesData: Dish[] = dishesRes.data ?? [];
      const mealsData: Meal[] = mealsRes.data ?? [];
      const mmData: MealMember[] = mmRes.data ?? [];

      const mealIds = new Set(mealsData.map((m) => m.id));
      const filteredMM = mmData.filter((mm) => mealIds.has(mm.meal_id));

      const enriched: MealWithDish[] = mealsData.map((meal) => ({
        ...meal,
        dish: dishesData.find((d) => d.id === meal.dish_id),
        meal_members: filteredMM
          .filter((mm) => mm.meal_id === meal.id)
          .map((mm) => ({
            ...mm,
            member: membersData.find((m) => m.id === mm.member_id)!,
          })),
      }));

      setMembers(membersData);
      setDishes(dishesData);
      setMeals(enriched);
      setExtras(extrasRes.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    fetchAll();

    // Realtime subscriptions
    const mealSub = supabase
      .channel("meals-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meals" },
        () => fetchAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meal_members" },
        () => fetchAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "extras" },
        () => fetchAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(mealSub);
    };
  }, [fetchAll]); // eslint-disable-line react-hooks/exhaustive-deps

  return { members, dishes, meals, extras, loading, error, refetch: fetchAll };
}
