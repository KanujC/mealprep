import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "amber" | "purple" | "green" | "red";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", { "bg-[var(--primary)] text-white": variant === "default", "bg-[var(--muted)] text-[var(--muted-foreground)]": variant === "secondary", "border border-[var(--border)] text-[var(--muted-foreground)]": variant === "outline", "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300": variant === "amber", "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300": variant === "purple", "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300": variant === "green", "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300": variant === "red" }, className)} {...props} />;
}
