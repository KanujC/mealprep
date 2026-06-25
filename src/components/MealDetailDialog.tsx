"use client";
import * as React from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Drumstick,
  Leaf,
  UtensilsCrossed,
  RotateCcw,
  Plus,
  Trash2,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { useToast } from "./ui/toast";
import {
  CHICKEN_ADDON_KCAL,
  Dish,
  Extra,
  MEAL_TYPES,
  MealType,
  MealWithDish,
  Member,
  QUICK_EXTRAS,
} from "@/lib/types";
import { parseDate, shortDay, shortDate } from "@/lib/utils";

interface MealDetailDialogProps {
  open: boolean;
  onClose: () => void;
  dateStr: string;
  meals: MealWithDish[];
  extras: Extra[];
  kanuj: Member;
  anshia: Member;
  dishes: Dish[];
  onRefetch: () => Promise<void>;
}

export function MealDetailDialog({
  open,
  onClose,
  dateStr,
  meals,
  extras,
  kanuj,
  anshia,
  dishes,
  onRefetch,
}: MealDetailDialogProps) {
  const supabase = getSupabaseClient();
  const { toast } = useToast();
  const date = parseDate(dateStr);
  const [saving, setSaving] = React.useState(false);

  // Calorie totals
  function totalKcal(memberId: string) {
    const mealKcal = meals.reduce((sum, meal) => {
      if (meal.eating_out) return sum;
      const mm = meal.meal_members.find((m) => m.member_id === memberId);
      if (!mm) return sum;
      const base =
        mm.calories ??
        (memberId === kanuj.id
          ? meal.dish?.base_calories_kanuj ?? 0
          : meal.dish?.base_calories_anshia ?? 0);
      return sum + base + (mm.includes_chicken ? CHICKEN_ADDON_KCAL : 0);
    }, 0);
    const extraKcal = extras
      .filter((e) => e.member_id === memberId)
      .reduce((s, e) => s + e.calories, 0);
    return mealKcal + extraKcal;
  }

  async function updateCalories(mmId: string, calories: number) {
    setSaving(true);
    const { error } = await supabase
      .from("meal_members")
      .update({ calories })
      .eq("id", mmId);
    if (error) toast(error.message, "error");
    else toast("Calories updated");
    await onRefetch();
    setSaving(false);
  }

  async function toggleChicken(mmId: string, current: boolean) {
    setSaving(true);
    const { error } = await supabase
      .from("meal_members")
      .update({ includes_chicken: !current })
      .eq("id", mmId);
    if (error) toast(error.message, "error");
    await onRefetch();
    setSaving(false);
  }

  async function toggleEatingOut(meal: MealWithDish) {
    setSaving(true);
    const { error } = await supabase
      .from("meals")
      .update({ eating_out: !meal.eating_out })
      .eq("id", meal.id);
    if (error) toast(error.message, "error");
    await onRefetch();
    setSaving(false);
  }

  async function setEatingOutLabel(meal: MealWithDish, label: string) {
    const { error } = await supabase
      .from("meals")
      .update({ eating_out_label: label })
      .eq("id", meal.id);
    if (error) toast(error.message, "error");
    await onRefetch();
  }

  async function addExtra(memberId: string, name: string, calories: number) {
    setSaving(true);
    const { error } = await supabase.from("extras").insert({
      date: dateStr,
      member_id: memberId,
      name,
      calories,
    });
    if (error) toast(error.message, "error");
    else toast(`Added ${name}`);
    await onRefetch();
    setSaving(false);
  }

  async function removeExtra(extraId: string) {
    setSaving(true);
    const { error } = await supabase.from("extras").delete().eq("id", extraId);
    if (error) toast(error.message, "error");
    await onRefetch();
    setSaving(false);
  }

  const kanujTotal = totalKcal(kanuj.id);
  const anshiaTotal = totalKcal(anshia.id);
  const kanujPct = (kanujTotal / kanuj.calorie_target) * 100;
  const anshiaPct = (anshiaTotal / anshia.calorie_target) * 100;

  const mealTypeLabel: Record<MealType, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    snack: "Snack",
    dinner: "Dinner",
  };

  return (
    <Dialog open={open} onClose={onClose} className="max-w-xl">
      <DialogHeader>
        <DialogTitle>
          {shortDay(date)}, {shortDate(date)}
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        {/* Calorie summary */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { member: kanuj, total: kanujTotal, pct: kanujPct, color: "amber" as const },
            { member: anshia, total: anshiaTotal, pct: anshiaPct, color: "purple" as const },
          ].map(({ member, total, pct, color }) => (
            <div
              key={member.id}
              className="rounded-xl p-3 bg-[var(--muted)]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[var(--foreground)]">
                  {member.name}
                </span>
                <span
                  className={`text-xs font-bold ${
                    pct > 110
                      ? "text-red-500"
                      : pct >= 90
                      ? "text-green-600"
                      : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {total} / {member.calorie_target}
                </span>
              </div>
              <Progress
                value={pct}
                color={pct > 110 ? "red" : pct >= 90 ? "green" : color}
              />
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                {Math.round(pct)}% of target
              </p>
            </div>
          ))}
        </div>

        {/* Meals */}
        <div className="space-y-4">
          {MEAL_TYPES.map((mealType) => {
            const meal = meals.find((m) => m.meal_type === mealType);
            if (!meal) return null;
            const dish = meal.dish;
            const kanujMM = meal.meal_members.find(
              (m) => m.member_id === kanuj.id
            );
            const anshiaMM = meal.meal_members.find(
              (m) => m.member_id === anshia.id
            );

            return (
              <div
                key={mealType}
                className="rounded-xl border border-[var(--border)] p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                      {mealTypeLabel[mealType]}
                    </span>
                    {meal.is_leftover_of && (
                      <span title="Leftover">
                        <RotateCcw size={11} className="text-[var(--muted-foreground)]" />
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleEatingOut(meal)}
                    className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      meal.eating_out
                        ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                    }`}
                  >
                    <UtensilsCrossed size={10} />
                    Eating out
                  </button>
                </div>

                {meal.eating_out ? (
                  <Input
                    placeholder="Where are you eating?"
                    defaultValue={meal.eating_out_label ?? ""}
                    onBlur={(e) => setEatingOutLabel(meal, e.target.value)}
                    className="text-sm"
                  />
                ) : dish ? (
                  <>
                    {anshiaMM?.member_dish && anshiaMM.member_dish.id !== dish.id ? (
                      <div className="mb-2 space-y-0.5">
                        <p className="text-sm font-semibold" style={{ color: "#b45309" }}>
                          K: {dish.name}
                        </p>
                        <p className="text-sm font-semibold" style={{ color: "#7c3aed" }}>
                          A: {anshiaMM.member_dish.name}
                        </p>
                      </div>
                    ) : (
                      <p className="font-semibold text-[var(--foreground)] mb-2">
                        {dish.name}
                        {dish.serve_with && dish.serve_with !== "none" && (
                          <span className="text-xs font-normal text-[var(--muted-foreground)] ml-2">
                            with {dish.serve_with}
                          </span>
                        )}
                      </p>
                    )}

                    {/* Per-member calorie edit */}
                    <div className="space-y-2">
                      {kanujMM && (
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium w-16"
                            style={{ color: "#b45309" }}
                          >
                            Kanuj
                          </span>
                          <CalorieInput
                            value={
                              kanujMM.calories ??
                              dish.base_calories_kanuj
                            }
                            onChange={(v) => updateCalories(kanujMM.id, v)}
                          />
                          {dish.allows_chicken_addon && (
                            <div className="flex items-center gap-1 ml-1">
                              <Drumstick size={12} className="text-amber-600" />
                              <Switch
                                checked={kanujMM.includes_chicken}
                                onChange={() =>
                                  toggleChicken(
                                    kanujMM.id,
                                    kanujMM.includes_chicken
                                  )
                                }
                              />
                              <span className="text-[10px] text-[var(--muted-foreground)]">
                                +{CHICKEN_ADDON_KCAL}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {anshiaMM && (
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium w-16"
                            style={{ color: "#7c3aed" }}
                          >
                            Anshia
                            {anshiaMM.is_paneer_swap && (
                              <Leaf
                                size={10}
                                className="inline ml-1 text-green-600"
                              />
                            )}
                          </span>
                          <CalorieInput
                            value={
                              anshiaMM.calories ??
                              (anshiaMM.member_dish?.base_calories_anshia ?? dish.base_calories_anshia)
                            }
                            onChange={(v) => updateCalories(anshiaMM.id, v)}
                          />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)] italic">
                    No meal assigned
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Extras */}
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            Extras
          </h3>

          {[
            { member: kanuj, color: "#b45309" },
            { member: anshia, color: "#7c3aed" },
          ].map(({ member, color }) => {
            const memberExtras = extras.filter(
              (e) => e.member_id === member.id
            );
            return (
              <div key={member.id} className="mb-3">
                <p className="text-xs font-medium mb-2" style={{ color }}>
                  {member.name}
                </p>
                {/* Quick add buttons */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {QUICK_EXTRAS.map((qe) => (
                    <button
                      key={qe.name}
                      onClick={() => addExtra(member.id, qe.name, qe.calories)}
                      disabled={saving}
                      className="text-[10px] px-2 py-1 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors flex items-center gap-1"
                    >
                      <Plus size={9} />
                      {qe.name}
                    </button>
                  ))}
                </div>
                {memberExtras.length > 0 && (
                  <div className="space-y-1">
                    {memberExtras.map((extra) => (
                      <div
                        key={extra.id}
                        className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-[var(--muted)]"
                      >
                        <span>{extra.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--muted-foreground)]">
                            {extra.calories} kcal
                          </span>
                          <button
                            onClick={() => removeExtra(extra.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CalorieInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [local, setLocal] = React.useState(String(value));
  React.useEffect(() => setLocal(String(value)), [value]);

  return (
    <input
      type="number"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const n = parseInt(local, 10);
        if (!isNaN(n) && n !== value) onChange(n);
      }}
      className="w-20 text-xs text-center border border-[var(--border)] rounded-lg px-2 py-1 bg-[var(--input)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
    />
  );
}
