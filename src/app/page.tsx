"use client";
import * as React from "react";
import {
  Shuffle,
  Undo2,
  BarChart2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
} from "lucide-react";
import { DayCard } from "@/components/DayCard";
import { MealDetailDialog } from "@/components/MealDetailDialog";
import { CalorieDashboard } from "@/components/CalorieDashboard";
import { PasscodeGate } from "@/components/PasscodeGate";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useWeekPlan } from "@/hooks/useWeekPlan";
import { MealType, MealWithDish } from "@/lib/types";
import { formatDate, getWeekDates, shortDate } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase";
// Mobile components
import { MobileWeekStrip } from "@/components/mobile/MobileWeekStrip";
import { MobileCalorieBars } from "@/components/mobile/MobileCalorieBars";
import { MobileDayDetail } from "@/components/mobile/MobileDayDetail";
import { MobileActionSheet } from "@/components/mobile/MobileActionSheet";
import { HelpSheet } from "@/components/mobile/HelpSheet";

type Tab = "week" | "dashboard";

export default function HomePage() {
  const [authed, setAuthed] = React.useState<boolean | null>(null);
  const [passcodeRequired, setPasscodeRequired] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => {
        if (!d.required) {
          setAuthed(true);
        } else {
          setPasscodeRequired(true);
          setAuthed(d.authed ?? false);
        }
      });
  }, []);

  if (authed === null)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (passcodeRequired && !authed)
    return <PasscodeGate onSuccess={() => setAuthed(true)} />;

  return <App />;
}

function App() {
  const { toast } = useToast();
  const supabase = getSupabaseClient();

  // ── Shared state ──────────────────────────────────────────────
  const [anchorDate, setAnchorDate] = React.useState(new Date());
  const [generating, setGenerating] = React.useState(false);
  const [undoStack, setUndoStack] = React.useState<string[]>([]);

  // ── Desktop-only state ────────────────────────────────────────
  const [tab, setTab] = React.useState<Tab>("week");
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailDate, setDetailDate] = React.useState<string>("");

  // ── Mobile-only state ─────────────────────────────────────────
  const [selectedDate, setSelectedDate] = React.useState(() => formatDate(new Date()));
  const [actionSheet, setActionSheet] = React.useState<{
    meal: MealWithDish;
    mealType: MealType;
  } | null>(null);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [calorieSheetOpen, setCalorieSheetOpen] = React.useState(false);

  // ── Data ──────────────────────────────────────────────────────
  const { members, dishes, meals, extras, loading, error, refetch } =
    useWeekPlan(anchorDate);

  const weekDates = getWeekDates(anchorDate);
  const kanuj = members.find((m) => m.name === "Kanuj");
  const anshia = members.find((m) => m.name === "Anshia");

  // ── Week navigation ───────────────────────────────────────────
  function shiftWeek(direction: 1 | -1) {
    const d = new Date(anchorDate);
    d.setDate(d.getDate() + direction * 7);
    setAnchorDate(d);
    // Update selectedDate: prefer today if new week contains it, else Monday
    const newDates = getWeekDates(d);
    const todayStr = formatDate(new Date());
    const hasToday = newDates.some((nd) => formatDate(nd) === todayStr);
    setSelectedDate(hasToday ? todayStr : formatDate(newDates[0]));
  }
  const prevWeek = () => shiftWeek(-1);
  const nextWeek = () => shiftWeek(1);

  // ── Week generation ───────────────────────────────────────────
  async function generateWeek() {
    setGenerating(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anchorDate: anchorDate.toISOString() }),
    });
    if (res.ok) {
      toast("Week generated!");
      await refetch();
    } else {
      toast("Generation failed", "error");
    }
    setGenerating(false);
  }

  // ── Meal shuffle ──────────────────────────────────────────────
  async function shuffleMeal(
    meal: MealWithDish | undefined,
    mealType: MealType,
    dateStr: string
  ) {
    if (!meal) return;
    setUndoStack((s) => [...s, meal.dish_id ?? ""]);
    const res = await fetch("/api/shuffle-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealId: meal.id, date: dateStr, mealType }),
    });
    const data = await res.json();
    if (res.ok) {
      toast(`Swapped to ${data.newDish}`);
      await refetch();
    } else {
      toast(data.error ?? "Shuffle failed", "error");
      setUndoStack((s) => s.slice(0, -1));
    }
  }

  // ── Mobile action handlers ────────────────────────────────────
  async function handleToggleEatingOut(meal: MealWithDish) {
    const { error } = await supabase
      .from("meals")
      .update({ eating_out: !meal.eating_out })
      .eq("id", meal.id);
    if (error) { toast(error.message, "error"); return; }
    toast(meal.eating_out ? "Removed eating out" : "Marked as eating out");
    await refetch();
  }

  async function handleToggleChicken(meal: MealWithDish) {
    const mm = meal.meal_members.find((m) => m.member_id === kanuj?.id);
    if (!mm) return;
    const { error } = await supabase
      .from("meal_members")
      .update({ includes_chicken: !mm.includes_chicken })
      .eq("id", mm.id);
    if (error) { toast(error.message, "error"); return; }
    toast(mm.includes_chicken ? "Chicken removed" : "Chicken added (+165 kcal)");
    await refetch();
  }

  // ── Derived ───────────────────────────────────────────────────
  const weekLabel = `${shortDate(weekDates[0])} – ${shortDate(weekDates[6])}`;
  const todayStr = formatDate(new Date());
  const isOnToday = selectedDate === todayStr;
  const selectedDayMeals = meals.filter((m) => m.date === selectedDate);
  const selectedDayExtras = extras.filter((e) => e.date === selectedDate);

  // ── Error / no-members state ──────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-3">{error}</p>
          <Button onClick={refetch}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!loading && (!kanuj || !anshia)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-[var(--muted-foreground)] mb-4">
            No members found. Run the seed script first.
          </p>
          <code className="text-xs bg-[var(--muted)] px-2 py-1 rounded">
            npx tsx scripts/seed.ts
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Header (sticky) ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Row 1: title + actions */}
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-base font-bold text-[var(--foreground)] shrink-0">
              🍽 Meal Planner
            </h1>

            {/* Desktop: week nav inline */}
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={prevWeek}>
                <ChevronLeft size={16} />
              </Button>
              <span className="text-xs font-medium text-[var(--foreground)] whitespace-nowrap">
                {weekLabel}
              </span>
              <Button variant="ghost" size="icon" onClick={nextWeek}>
                <ChevronRight size={16} />
              </Button>
            </div>

            {/* Desktop: undo + chart + shuffle */}
            <div className="hidden md:flex items-center gap-1">
              {undoStack.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setUndoStack((s) => s.slice(0, -1));
                    toast("Undo: regenerate the week to fully reset", "info");
                  }}
                  title="Undo"
                >
                  <Undo2 size={14} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTab(tab === "week" ? "dashboard" : "week")}
                title="Calories"
              >
                <BarChart2 size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateWeek}
                disabled={generating}
              >
                {generating ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Shuffle size={12} />
                )}
                {generating ? "Generating…" : "Shuffle week"}
              </Button>
            </div>

            {/* Mobile: chart + shuffle + help */}
            <div className="md:hidden flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCalorieSheetOpen(true)}
                title="Calories"
              >
                <BarChart2 size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={generateWeek}
                disabled={generating}
                title="Shuffle week"
              >
                {generating ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Shuffle size={16} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setHelpOpen(true)}
                title="Help"
              >
                <Info size={16} />
              </Button>
            </div>
          </div>

          {/* Desktop-only: Week / Calories tabs */}
          <div className="hidden md:flex mt-2 gap-1">
            {(["week", "dashboard"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  tab === t
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {t === "week" ? "Week" : "Calories"}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile-only: week strip + calorie bars (inside sticky header) */}
        <div className="md:hidden border-t border-[var(--border)]">
          <MobileWeekStrip
            weekDates={weekDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevWeek={prevWeek}
            onNextWeek={nextWeek}
          />
          {kanuj && anshia && (
            <MobileCalorieBars
              meals={selectedDayMeals}
              extras={selectedDayExtras}
              kanuj={kanuj}
              anshia={anshia}
            />
          )}
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────── */}
      <main>
        {/* Loading spinner */}
        {loading && meals.length === 0 && (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── Mobile: day detail ──────────────────────────── */}
        {!loading && kanuj && anshia && (
          <div className="md:hidden">
            {selectedDayMeals.length > 0 ? (
              <MobileDayDetail
                dateStr={selectedDate}
                meals={selectedDayMeals}
                kanuj={kanuj}
                anshia={anshia}
                onLongPress={(meal, mealType) => setActionSheet({ meal, mealType })}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-4">
                <p className="text-[var(--muted-foreground)]">
                  No meals for this week yet.
                </p>
                <Button onClick={generateWeek} disabled={generating}>
                  <Shuffle size={14} />
                  Generate week
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Desktop: existing grid / dashboard ─────────── */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 py-4">
          {tab === "dashboard" && kanuj && anshia ? (
            <CalorieDashboard
              meals={meals}
              extras={extras}
              kanuj={kanuj}
              anshia={anshia}
              anchorDate={anchorDate}
            />
          ) : (
            <>
              <div className="overflow-x-auto pb-4 -mx-4 px-4">
                <div className="flex gap-2.5 min-w-max sm:min-w-0 sm:grid sm:grid-cols-7">
                  {weekDates.map((date) => {
                    if (!kanuj || !anshia) return null;
                    const dateStr = formatDate(date);
                    const dayMeals = meals.filter((m) => m.date === dateStr);
                    const dayExtras = extras.filter((e) => e.date === dateStr);
                    return (
                      <DayCard
                        key={dateStr}
                        dateStr={dateStr}
                        meals={dayMeals}
                        extras={dayExtras}
                        kanuj={kanuj}
                        anshia={anshia}
                        dishes={dishes}
                        onMealClick={() => {
                          setDetailDate(dateStr);
                          setDetailOpen(true);
                        }}
                        onShuffle={(mealType) => {
                          const meal = dayMeals.find((m) => m.meal_type === mealType);
                          shuffleMeal(meal, mealType, dateStr);
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-[10px] text-[var(--muted-foreground)]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  Kanuj (1900 kcal)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                  Anshia (1500 kcal, veg)
                </span>
                <span>↺ Leftover</span>
                <span>★ Easy</span>
                <span>🍴 Eating out</span>
              </div>

              {meals.length === 0 && !loading && (
                <div className="mt-8 text-center">
                  <p className="text-[var(--muted-foreground)] mb-3">
                    No meals for this week yet.
                  </p>
                  <Button onClick={generateWeek} disabled={generating}>
                    <Shuffle size={14} />
                    Generate week
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Mobile: Today floating button ───────────────────── */}
      {!isOnToday && (
        <button
          className="fixed bottom-6 left-4 z-30 md:hidden px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold rounded-full shadow-lg active:opacity-80 transition-opacity"
          onClick={() => {
            const today = new Date();
            setAnchorDate(today);
            setSelectedDate(formatDate(today));
          }}
        >
          Today
        </button>
      )}

      {/* ── Mobile overlays ──────────────────────────────────── */}
      <MobileActionSheet
        open={!!actionSheet}
        meal={actionSheet?.meal ?? null}
        mealType={actionSheet?.mealType ?? null}
        onClose={() => setActionSheet(null)}
        onShuffle={() => {
          if (actionSheet) {
            shuffleMeal(actionSheet.meal, actionSheet.mealType, selectedDate);
          }
        }}
        onToggleEatingOut={() => actionSheet && handleToggleEatingOut(actionSheet.meal)}
        onEditCalories={() => {
          setDetailDate(selectedDate);
          setDetailOpen(true);
        }}
        onToggleChicken={() => actionSheet && handleToggleChicken(actionSheet.meal)}
      />

      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Mobile calorie full-screen sheet */}
      {calorieSheetOpen && kanuj && anshia && (
        <div className="fixed inset-0 z-50 md:hidden bg-[var(--background)] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Calories</h2>
            <button
              onClick={() => setCalorieSheetOpen(false)}
              className="p-1.5 rounded-xl hover:bg-[var(--muted)]"
            >
              <X size={18} className="text-[var(--muted-foreground)]" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <CalorieDashboard
              meals={meals}
              extras={extras}
              kanuj={kanuj}
              anshia={anshia}
              anchorDate={anchorDate}
            />
          </div>
        </div>
      )}

      {/* Desktop + mobile "Edit calories" dialog */}
      {detailDate && kanuj && anshia && (
        <MealDetailDialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          dateStr={detailDate}
          meals={meals.filter((m) => m.date === detailDate)}
          extras={extras.filter((e) => e.date === detailDate)}
          kanuj={kanuj}
          anshia={anshia}
          dishes={dishes}
          onRefetch={refetch}
        />
      )}
    </div>
  );
}
