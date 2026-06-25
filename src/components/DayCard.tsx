"use client";
import * as React from "react";
import { MealCell } from "./MealCell";
import { cn, shortDay, shortDate, isToday, parseDate } from "@/lib/utils";
import { Dish, MEAL_TYPES, MealType, MealWithDish, Member, Extra } from "@/lib/types";

interface DayCardProps { dateStr: string; meals: MealWithDish[]; extras: Extra[]; kanuj: Member; anshia: Member; dishes: Dish[]; onMealClick: (meal: MealWithDish | undefined, mealType: MealType) => void; onShuffle: (mealType: MealType) => void; }

export function DayCard({ dateStr, meals, extras, kanuj, anshia, onMealClick, onShuffle }: DayCardProps) {
  const date = parseDate(dateStr);
  const today = isToday(date);

  const kanujTotal = meals.reduce((sum, meal) => {
    if (meal.eating_out) return sum;
    const mm = meal.meal_members.find((m) => m.member_id === kanuj.id);
    if (!mm) return sum;
    return sum + (mm.calories ?? meal.dish?.base_calories_kanuj ?? 0) + (mm.includes_chicken ? 165 : 0);
  }, 0) + extras.filter((e) => e.member_id === kanuj.id).reduce((s, e) => s + e.calories, 0);

  const anshiaTotal = meals.reduce((sum, meal) => {
    if (meal.eating_out) return sum;
    const mm = meal.meal_members.find((m) => m.member_id === anshia.id);
    if (!mm) return sum;
    return sum + (mm.calories ?? meal.dish?.base_calories_anshia ?? 0);
  }, 0) + extras.filter((e) => e.member_id === anshia.id).reduce((s, e) => s + e.calories, 0);

  const kanujPct = Math.round((kanujTotal / kanuj.calorie_target) * 100);
  const anshiaPct = Math.round((anshiaTotal / anshia.calorie_target) * 100);

  return (
    <div className={cn("rounded-2xl border bg-[var(--card)] overflow-hidden transition-all min-w-[160px]", today ? "border-[var(--primary)] shadow-md" : "border-[var(--border)]}")}>
      <div className={cn("px-3 py-2.5 border-b border-[var(--border)]", today ? "bg-[var(--accent)]" : "bg-[var(--muted)]")}>
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-xs font-bold uppercase tracking-wide", today ? "text-[var(--accent-foreground)]" : "text-[var(--muted-foreground)]")}>{shortDay(date)}</p>
            <p className={cn("text-sm font-semibold", today ? "text-[var(--accent-foreground)]" : "text-[var(--foreground)]")}>{shortDate(date)}</p>
          </div>
          {today && <span className="text-[10px] font-bold bg-[var(--primary)] text-white px-2 py-0.5 rounded-full">Today</span>}
        </div>
        <div className="mt-1.5 flex gap-2 text-[10px]">
          <span className={cn("font-medium", kanujPct > 110 ? "text-red-500" : kanujPct >= 90 ? "text-green-600" : "text-[var(--muted-foreground)]")}> K {kanujTotal}</span>
          <span className={cn("font-medium", anshiaPct > 110 ? "text-red-500" : anshiaPct >= 90 ? "text-green-600" : "text-[var(--muted-foreground)]")}> A {anshiaTotal}</span>
        </div>
      </div>
      <div className="p-2 flex flex-col gap-2">
        {MEAL_TYPES.map((mealType) => {
          const meal = meals.find((m) => m.meal_type === mealType);
          return <MealCell key={mealType} meal={meal} mealType={mealType} kanuj={kanuj} anshia={anshia} onShuffle={() => onShuffle(mealType)} onClick={() => onMealClick(meal, mealType)} />;
        })}
      </div>
    </div>
  );
}
