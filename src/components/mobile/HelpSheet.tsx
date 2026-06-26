"use client";
import { X, RotateCcw, Star, UtensilsCrossed } from "lucide-react";

interface Props { open: boolean; onClose: () => void; }

const ITEMS = [
  {
    icon: <RotateCcw size={15} />,
    label: "↺ Leftover",
    desc: "Lunch carried over from yesterday's dinner",
  },
  {
    icon: <Star size={15} style={{ color: "#f59e0b" }} />,
    label: "★ Easy dish",
    desc: "Can repeat every week without getting repetitive",
  },
  {
    icon: <UtensilsCrossed size={15} style={{ color: "#3b82f6" }} />,
    label: "Eating out",
    desc: "Meal not counted in the daily calorie total",
  },
  {
    icon: <span className="text-xs font-bold" style={{ color: "#b45309" }}>K</span>,
    label: "Kanuj",
    desc: "Amber — 1900 kcal daily target, eats everything",
  },
  {
    icon: <span className="text-xs font-bold" style={{ color: "#7c3aed" }}>A</span>,
    label: "Anshia",
    desc: "Purple — 1500 kcal daily target, vegetarian",
  },
  {
    icon: <span className="text-xs">↺</span>,
    label: "Long-press a meal",
    desc: "Opens shuffle, eating-out, calorie edit, and chicken toggle",
  },
];

export function HelpSheet({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-[var(--card)] rounded-t-3xl shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--muted-foreground)]/25" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
          <h3 className="text-base font-semibold text-[var(--foreground)]">Icon guide</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[var(--muted)]">
            <X size={16} className="text-[var(--muted-foreground)]" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {ITEMS.map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <span className="w-5 flex justify-center mt-0.5 text-[var(--muted-foreground)]">
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 pb-8 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[var(--muted)] text-[15px] font-semibold text-[var(--foreground)]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
