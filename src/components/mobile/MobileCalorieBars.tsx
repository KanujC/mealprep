"use client";
import { MealWithDish, Member, Extra, CHICKEN_ADDON_KCAL } from "@/lib/types";

interface Props {
  meals: MealWithDish[];
  extras: Extra[];
  kanuj: Member;
  anshia: Member;
}

export function MobileCalorieBars({ meals, extras, kanuj, anshia }: Props) {
  function kcal(member: Member) {
    const fromMeals = meals.reduce((s, meal) => {
      if (meal.eating_out) return s;
      const mm = meal.meal_members.find((m) => m.member_id === member.id);
      if (!mm) return s;
      const base =
        mm.calories ??
        (member.id === kanuj.id
          ? meal.dish?.base_calories_kanuj ?? 0
          : mm.member_dish?.base_calories_anshia ?? meal.dish?.base_calories_anshia ?? 0);
      return s + base + (mm.includes_chicken ? CHICKEN_ADDON_KCAL : 0);
    }, 0);
    const fromExtras = extras
      .filter((e) => e.member_id === member.id)
      .reduce((s, e) => s + e.calories, 0);
    return fromMeals + fromExtras;
  }

  return (
    <div className="px-4 pb-3 space-y-1.5 border-b border-[var(--border)]">
      {[
        { member: kanuj, color: "#b45309" },
        { member: anshia, color: "#7c3aed" },
      ].map(({ member, color }) => {
        const total = kcal(member);
        const pct = Math.min((total / member.calorie_target) * 100, 100);
        const over = total > member.calorie_target * 1.1;
        return (
          <div key={member.id} className="flex items-center gap-2">
            <span className="text-[11px] font-bold w-3 shrink-0" style={{ color }}>
              {member.name[0]}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, background: over ? "#ef4444" : color }}
              />
            </div>
            <span className="text-[10px] text-[var(--muted-foreground)] shrink-0 w-[4.5rem] text-right">
              {total} / {member.calorie_target}
            </span>
          </div>
        );
      })}
    </div>
  );
}
