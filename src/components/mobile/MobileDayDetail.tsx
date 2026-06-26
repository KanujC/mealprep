"use client";
import * as React from "react";
import { RotateCcw, Shuffle } from "lucide-react";
import { MEAL_TYPES, MealType, MealWithDish, Member, CHICKEN_ADDON_KCAL } from "@/lib/types";
import { parseDate, shortDay, shortDate } from "@/lib/utils";

const BORDER_COLOR: Record<MealType, string> = {
  breakfast: "#f59e0b",
  lunch:     "#22c55e",
  snack:     "#eab308",
  dinner:    "#6366f1",
};

const LABEL: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch:     "Lunch",
  snack:     "Snack",
  dinner:    "Dinner",
};

interface Props {
  dateStr: string;
  meals: MealWithDish[];
  kanuj: Member;
  anshia: Member;
  onLongPress: (meal: MealWithDish, mealType: MealType) => void;
  onShuffle: (meal: MealWithDish, mealType: MealType) => void;
}

export function MobileDayDetail({ dateStr, meals, kanuj, anshia, onLongPress, onShuffle }: Props) {
  const date = parseDate(dateStr);
  return (
    <div className="px-4 pt-4 pb-28">
      <p className="text-sm font-semibold text-[var(--foreground)] mb-3">
        {shortDay(date)}, {shortDate(date)}
      </p>
      <div className="space-y-3">
        {MEAL_TYPES.map((mealType) => {
          const meal = meals.find((m) => m.meal_type === mealType);
          return (
            <MealCard
              key={mealType}
              meal={meal}
              mealType={mealType}
              kanuj={kanuj}
              anshia={anshia}
              onLongPress={() => meal && onLongPress(meal, mealType)}
              onShuffle={() => meal && onShuffle(meal, mealType)}
            />
          );
        })}
      </div>
    </div>
  );
}

function MealCard({
  meal, mealType, kanuj, anshia, onLongPress, onShuffle,
}: {
  meal: MealWithDish | undefined;
  mealType: MealType;
  kanuj: Member;
  anshia: Member;
  onLongPress: () => void;
  onShuffle: () => void;
}) {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const movedRef = React.useRef(false);

  const dish = meal?.dish;
  const kanujMM = meal?.meal_members.find((m) => m.member_id === kanuj.id);
  const anshiaMM = meal?.meal_members.find((m) => m.member_id === anshia.id);

  const kanujKcal = dish
    ? (kanujMM?.calories ?? dish.base_calories_kanuj) + (kanujMM?.includes_chicken ? CHICKEN_ADDON_KCAL : 0)
    : 0;
  const anshiaKcal = dish
    ? (anshiaMM?.calories ?? (anshiaMM?.member_dish?.base_calories_anshia ?? dish.base_calories_anshia))
    : 0;

  const isLeftoverLunch = !!meal?.is_leftover_of && mealType === "lunch";
  const isEatingOut = !!meal?.eating_out;

  function pressStart() {
    movedRef.current = false;
    timerRef.current = setTimeout(() => {
      if (!movedRef.current) onLongPress();
    }, 480);
  }
  function pressCancel() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }
  function pressMove() {
    movedRef.current = true;
    pressCancel();
  }

  return (
    <div
      className={`rounded-2xl border border-[var(--border)] overflow-hidden select-none active:opacity-70 transition-opacity ${
        isLeftoverLunch ? "bg-[var(--muted)]/40" : "bg-[var(--card)]"
      }`}
      style={{ borderLeftWidth: 3, borderLeftColor: BORDER_COLOR[mealType] }}
      onTouchStart={pressStart}
      onTouchMove={pressMove}
      onTouchEnd={pressCancel}
      onMouseDown={pressStart}
      onMouseUp={pressCancel}
      onMouseLeave={pressCancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="px-3.5 py-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            {LABEL[mealType]}
          </span>
          <div className="flex items-center gap-1.5">
            {isLeftoverLunch && (
              <span className="flex items-center gap-0.5 text-[9px] text-[var(--muted-foreground)] bg-[var(--muted)] px-1.5 py-0.5 rounded-full">
                <RotateCcw size={8} />
                leftover
              </span>
            )}
            {isEatingOut && !isLeftoverLunch && (
              <span className="text-[9px] font-medium text-blue-500">Eating out</span>
            )}
            {(mealType === "lunch" || mealType === "dinner") && meal && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onShuffle(); }}
                className="p-1 rounded-lg active:bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                <Shuffle size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {isEatingOut ? (
          <p className="text-[15px] font-bold text-blue-600 dark:text-blue-400">
            {meal?.eating_out_label || "Eating out"}
          </p>
        ) : dish ? (
          <>
            {/* Dish name — split for breakfast if K/A differ */}
            {anshiaMM?.member_dish && anshiaMM.member_dish.id !== dish.id ? (
              <div className="space-y-0.5 mb-1">
                <p className="text-[15px] font-bold leading-tight">
                  <span style={{ color: "#b45309" }}>K</span>{" "}
                  <span className="text-[var(--foreground)]">{dish.name}</span>
                </p>
                <p className="text-sm font-semibold leading-tight">
                  <span style={{ color: "#7c3aed" }}>A</span>{" "}
                  <span className="text-[var(--foreground)]">{anshiaMM.member_dish.name}</span>
                </p>
              </div>
            ) : (
              <p className="text-[15px] font-bold text-[var(--foreground)] leading-tight mb-0.5">
                {anshiaMM?.is_paneer_swap
                  ? dish.name.replace(/chicken/i, "Paneer")
                  : dish.name}
              </p>
            )}
            {dish.serve_with && dish.serve_with !== "none" && (
              <p className="text-[11px] text-[var(--muted-foreground)] mb-2">
                with {dish.serve_with}
              </p>
            )}

            {/* Calorie line */}
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-[var(--muted-foreground)]">
                <span className="font-bold" style={{ color: "#b45309" }}>K</span>{" "}
                {kanujKcal}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                <span className="font-bold" style={{ color: "#7c3aed" }}>A</span>{" "}
                {anshiaKcal}
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm italic text-[var(--muted-foreground)]">No meal set</p>
        )}
      </div>
    </div>
  );
}
