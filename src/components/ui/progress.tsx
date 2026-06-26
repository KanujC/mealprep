import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps { value: number; className?: string; color?: "amber" | "green" | "red" | "purple"; }

export function Progress({ value, className, color = "amber" }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const colorClass = { amber: "bg-amber-500", green: "bg-green-500", red: "bg-red-500", purple: "bg-purple-500" }[color];
  return (
    <div className={cn("h-2 w-full rounded-full bg-[var(--muted)] overflow-hidden", className)}>
      <div className={cn("h-full rounded-full transition-all duration-500", colorClass)} style={{ width: `${clamped}%` }} />
    </div>
  );
}
