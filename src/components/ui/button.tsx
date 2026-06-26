"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button ref={ref} className={cn(
      "inline-flex items-center justify-center gap-2 font-medium transition-all rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none",
      { "bg-[var(--primary)] text-white hover:opacity-90 shadow-sm": variant === "default", "border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)]": variant === "outline", "hover:bg-[var(--muted)] text-[var(--foreground)]": variant === "ghost", "bg-red-500 text-white hover:bg-red-600": variant === "destructive", "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80": variant === "secondary" },
      { "text-xs px-2.5 py-1.5": size === "sm", "text-sm px-4 py-2": size === "md", "text-base px-5 py-2.5": size === "lg", "w-8 h-8 p-0 rounded-lg": size === "icon" },
      className
    )} {...props} />
  )
);
Button.displayName = "Button";
