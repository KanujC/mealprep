"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight, Shuffle, Undo2, BarChart2, RefreshCw } from "lucide-react";
import { DayCard } from "@/components/DayCard";
import { MealDetailDialog } from "@/components/MealDetailDialog";
import { CalorieDashboard } from "@/components/CalorieDashboard";
import { PasscodeGate } from "@/components/PasscodeGate";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useWeekPlan } from "@/hooks/useWeekPlan";
import { MealType, MealWithDish } from "@/lib/types";
import { formatDate, getWeekDates, shortDate } from "@/lib/utils";

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
  const [anchorDate, setAnchorDate] = React.useState(new Date());
  const [tab, setTab] = React.useState<Tab>("week");
  const [generating, setGenerating] = React.useState(false);
  const [undoStack, setUndoStack] = React.useState<string[]>([]);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailDate, setDetailDate] = React.useState<string>("");

  const { members, dishes, meals, extras, loading, error, refetch } =
    useWeekPlan(anchorDate);

  const weekDates = getWeekDates(anchorDate);
  const kanuj = members.find((m) => m.name === "Kanuj");
  const anshia = members.find((m) => m.name === "Anshia");

  function prevWeek() {
    const d = new Date(anchorDate);
    d.setDate(d.getDate() - 7);
    setAnchorDate(d);
  }

  function nextWeek() {
    const d = new Date(anchorDate);
    d.setDate(d.getDate() + 7);
    setAnchorDate(d);
  }

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

  const weekLabel = `${shortDate(weekDates[0])} – ${shortDate(weekDates[6])}`;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-base font-bold text-[var(--foreground)] shrink-0">
              🍽 Meal Planner
            </h1>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={prevWeek}>
                <ChevronLeft size={16} />
              </Button>
              <span className="text-xs font-medium text-[var(--foreground)] hidden sm:block whitespace-nowrap">
                {weekLabel}
              </span>
              <Button variant="ghost" size="icon" onClick={nextWeek}>
                <ChevronRight size={16} />
              </Button>
            </div>

            <div className="flex items-center gap-1">
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
                className="hidden sm:flex"
              >
                {generating ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Shuffle size={12} />
                )}
                {generating ? "Generating…" : "Shuffle week"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={generateWeek}
                disabled={generating}
                className="sm:hidden"
              >
                {generating ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Shuffle size={14} />
                )}
              </Button>
            </div>
          </div>

          <div className="flex mt-2 gap-1">
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
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {loading && meals.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === "dashboard" && kanuj && anshia ? (
          <CalorieDashboard
            meals={meals}
            extras={extras}
            kanuj={kanuj}
            anshia={anshia}
            anchorDate={anchorDate}
          />
        ) : (
          <>
            <p className="sm:hidden text-xs text-center text-[var(--muted-foreground)] mb-3">
              {weekLabel}
            </p>

            {/* Weekly grid */}
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
                        const meal = dayMeals.find(
                          (m) => m.meal_type === mealType
                        );
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
      </main>

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
