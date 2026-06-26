"use client";
import * as React from "react";
import { Progress } from "./ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CHICKEN_ADDON_KCAL, Extra, MealWithDish, Member } from "@/lib/types";
import { getWeekDates, formatDate, parseDate, shortDay } from "@/lib/utils";

interface Props { meals: MealWithDish[]; extras: Extra[]; kanuj: Member; anshia: Member; anchorDate: Date; }

export function CalorieDashboard({ meals, extras, kanuj, anshia, anchorDate }: Props) {
  const weekDates = getWeekDates(anchorDate);

  function dayTotal(memberId: string, dateStr: string) {
    const dayMeals = meals.filter((m) => m.date === dateStr);
    const mealKcal = dayMeals.reduce((sum, meal) => {
      if (meal.eating_out) return sum;
      const mm = meal.meal_members.find((m) => m.member_id === memberId);
      if (!mm) return sum;
      const base = mm.calories ?? (memberId === kanuj.id ? meal.dish?.base_calories_kanuj ?? 0 : meal.dish?.base_calories_anshia ?? 0);
      return sum + base + (mm.includes_chicken ? CHICKEN_ADDON_KCAL : 0);
    }, 0);
    const extraKcal = extras.filter((e) => e.member_id === memberId && e.date === dateStr).reduce((s, e) => s + e.calories, 0);
    return mealKcal + extraKcal;
  }

  const members = [
    { member: kanuj, color: "amber" as const, accent: "#b45309" },
    { member: anshia, color: "purple" as const, accent: "#7c3aed" },
  ];

  return (
    <div className="space-y-5">
      {members.map(({ member, color, accent }) => {
        const dailyTotals = weekDates.map((d) => ({ dateStr: formatDate(d), date: d, total: dayTotal(member.id, formatDate(d)) }));
        const daysWithData = dailyTotals.filter((d) => d.total > 0);
        const weekAvg = daysWithData.length > 0 ? Math.round(daysWithData.reduce((s, d) => s + d.total, 0) / daysWithData.length) : 0;
        return (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ color: accent }}>{member.name}</CardTitle>
                <div className="text-right">
                  <p className="text-xs text-[var(--muted-foreground)]">Weekly avg</p>
                  <p className="text-lg font-bold" style={{ color: accent }}>{weekAvg}<span className="text-xs font-normal text-[var(--muted-foreground)] ml-1">/ {member.calorie_target} kcal</span></p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {dailyTotals.map(({ dateStr, date, total }) => {
                  const pct = (total / member.calorie_target) * 100;
                  const barColor = pct > 110 ? "red" : pct >= 85 ? "green" : color;
                  return (
                    <div key={dateStr}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--muted-foreground)] w-8">{shortDay(date)}</span>
                        <div className="flex-1 mx-3"><Progress value={pct} color={barColor} /></div>
                        <span className={`text-xs font-semibold w-20 text-right ${pct > 110 ? "text-red-500" : pct >= 85 ? "text-green-600" : "text-[var(--muted-foreground)]"}`}>{total > 0 ? `${total} kcal` : "—"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
