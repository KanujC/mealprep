"use client";
import * as React from "react";
import { RotateCcw, UtensilsCrossed, Leaf, Drumstick, Star, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHICKEN_ADDON_KCAL, MealType, MealWithDish, Member } from "@/lib/types";

interface MealCellProps { meal: MealWithDish | undefined; mealType: MealType; kanuj: Member; anshia: Member; onShuffle: () => void; onClick: () => void; }

export function MealCell({ meal, mealType, kanuj, anshia, onShuffle, onClick }: MealCellProps) {
  const dish = meal?.dish;
  const isLeftover = !!meal?.is_leftover_of;
  const isEatingOut = meal?.eating_out;
  const kanujMM = meal?.meal_members.find((m) => m.member_id === kanuj.id);
  const anshiaMM = meal?.meal_members.find((m) => m.member_id === anshia.id);
  const kanujKcal = meal ? (kanujMM?.calories ?? dish?.base_calories_kanuj ?? 0) + (kanujMM?.includes_chicken ? CHICKEN_ADDON_KCAL : 0) : 0;
  const anshiaKcal = meal ? anshiaMM?.calories ?? dish?.base_calories_anshia ?? 0 : 0;
  const mealTypeLabel = { breakfast: "Breakfast", lunch: "Lunch", snack: "Snack", dinner: "Dinner" }[mealType];

  return (
    <div className="group relative rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:shadow-sm transition-all cursor-pointer overflow-hidden" onClick={onClick}>
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{mealTypeLabel}</span>
        <div className="flex items-center gap-1">
          {isLeftover && <span title="Leftover"><RotateCcw size={11} className="text-[var(--muted-foreground)]" /></span>}
          {dish?.is_easy && <span title="Easy"><Star size={11} className="text-amber-400" /></span>}
          {isEatingOut && <span title="Eating out"><UtensilsCrossed size={11} className="text-blue-500" /></span>}
        </div>
      </div>
      <div className="px-3 pb-1.5">
        {isEatingOut ? (
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{meal?.eating_out_label || "Eating out"}</p>
        ) : dish ? (
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)] leading-tight truncate">{anshiaMM?.is_paneer_swap ? dish.name.replace(/chicken/i, "Paneer") : dish.name}</p>
            {dish.serve_with && dish.serve_with !== "none" && <span className="text-[10px] text-[var(--muted-foreground)]">with {dish.serve_with}</span>}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)] italic">No meal set</p>
        )}
      </div>
      {!isEatingOut && dish && (
        <div className="px-3 pb-2.5 flex gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.12)", color: "#b45309" }}>
            {kanujMM?.includes_chicken && <Drumstick size={9} />}{kanujKcal} kcal
          </span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.12)", color: "#7c3aed" }}>
            {anshiaMM?.is_paneer_swap && <Leaf size={9} />}{anshiaKcal} kcal
          </span>
        </div>
      )}
      <button onClick={(e) => { e.stopPropagation(); onShuffle(); }}
        className={cn("absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}>
        <RefreshCw size={12} />
      </button>
    </div>
  );
}
