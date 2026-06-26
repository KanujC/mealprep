"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps { checked: boolean; onChange: (checked: boolean) => void; className?: string; disabled?: boolean; }

export function Switch({ checked, onChange, className, disabled }: SwitchProps) {
  return (
    <button role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed", checked ? "bg-[var(--primary)]" : "bg-[var(--muted)]", className)}>
      <span className={cn("pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform ring-0 transition-transform duration-200", checked ? "translate-x-4" : "translate-x-0")} />
    </button>
  );
}
