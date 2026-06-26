"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, isToday } from "@/lib/utils";

interface Props {
  weekDates: Date[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function weekRangeLabel(dates: Date[]) {
  const s = dates[0], e = dates[6];
  const sameMonth = s.getMonth() === e.getMonth();
  const start = sameMonth ? `${s.getDate()}` : `${s.getDate()} ${MONTHS[s.getMonth()]}`;
  return `${start} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
}

export function MobileWeekStrip({ weekDates, selectedDate, onSelectDate, onPrevWeek, onNextWeek }: Props) {
  const startX = React.useRef<number | null>(null);

  return (
    <div className="select-none">
      {/* Week range nav */}
      <div className="flex items-center justify-between px-3 py-2">
        <button
          onClick={onPrevWeek}
          className="p-1.5 rounded-xl active:bg-[var(--muted)] text-[var(--muted-foreground)]"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-xs font-semibold text-[var(--foreground)]">
          {weekRangeLabel(weekDates)}
        </span>
        <button
          onClick={onNextWeek}
          className="p-1.5 rounded-xl active:bg-[var(--muted)] text-[var(--muted-foreground)]"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day strip — swipeable */}
      <div
        className="flex px-2 pb-3"
        onTouchStart={(e) => { startX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (startX.current === null) return;
          const dx = e.changedTouches[0].clientX - startX.current;
          if (dx < -50) onNextWeek();
          else if (dx > 50) onPrevWeek();
          startX.current = null;
        }}
      >
        {weekDates.map((date, i) => {
          const ds = formatDate(date);
          const today = isToday(date);
          const selected = ds === selectedDate && !today;
          return (
            <button
              key={ds}
              onClick={() => onSelectDate(ds)}
              className="flex-1 flex flex-col items-center gap-1 py-0.5"
            >
              <span className="text-[9px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {DAY_LETTERS[i]}
              </span>
              <span
                className={`w-7 h-7 flex items-center justify-center text-[13px] font-semibold rounded-full transition-colors ${
                  today
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : selected
                    ? "ring-2 ring-[var(--foreground)] text-[var(--foreground)]"
                    : "text-[var(--foreground)]"
                }`}
              >
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
