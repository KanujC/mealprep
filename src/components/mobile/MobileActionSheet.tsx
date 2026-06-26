"use client";
import * as React from "react";
import { Shuffle, UtensilsCrossed, Edit3, Drumstick } from "lucide-react";
import { MealType, MealWithDish } from "@/lib/types";

interface Props {
  open: boolean;
  meal: MealWithDish | null;
  mealType: MealType | null;
  onClose: () => void;
  onShuffle: () => void;
  onToggleEatingOut: () => void;
  onEditCalories: () => void;
  onToggleChicken: () => void;
}

export function MobileActionSheet({
  open, meal, mealType, onClose,
  onShuffle, onToggleEatingOut, onEditCalories, onToggleChicken,
}: Props) {
  if (!open || !meal || !mealType) return null;
  const canChicken = meal.dish?.allows_chicken_addon === true;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-[var(--card)] rounded-t-3xl shadow-2xl">
        {/* Pull handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--muted-foreground)]/25" />
        </div>

        {/* Meal label */}
        <div className="px-5 py-3 border-b border-[var(--border)]">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-0.5">
            {mealType}
          </p>
          <p className="text-[15px] font-semibold text-[var(--foreground)]">
            {meal.dish?.name ?? "No meal assigned"}
          </p>
        </div>

        {/* Actions */}
        <div className="py-1">
          <ActionRow
            icon={<Shuffle size={18} />}
            label="Shuffle this meal"
            onClick={() => { onShuffle(); onClose(); }}
          />
          <ActionRow
            icon={<UtensilsCrossed size={18} />}
            label={meal.eating_out ? "Remove eating out" : "Mark as eating out"}
            onClick={() => { onToggleEatingOut(); onClose(); }}
          />
          <ActionRow
            icon={<Edit3 size={18} />}
            label="Edit calories"
            onClick={() => { onEditCalories(); onClose(); }}
          />
          {canChicken && (
            <ActionRow
              icon={<Drumstick size={18} />}
              label="Toggle Kanuj's chicken (+165 kcal)"
              onClick={() => { onToggleChicken(); onClose(); }}
            />
          )}
        </div>

        {/* Cancel */}
        <div className="px-4 pb-8 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[var(--muted)] text-[15px] font-semibold text-[var(--foreground)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-3.5 active:bg-[var(--muted)] transition-colors text-left"
    >
      <span className="text-[var(--muted-foreground)] shrink-0">{icon}</span>
      <span className="text-[15px] text-[var(--foreground)]">{label}</span>
    </button>
  );
}
