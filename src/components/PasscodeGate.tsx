"use client";
import * as React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Lock } from "lucide-react";

export function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(false);
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: value }) });
    if (res.ok) { onSuccess(); } else { setError(true); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)] mb-4">
            <Lock size={24} className="text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Meal Planner</h1>
          <p className="text-[var(--muted-foreground)] mt-1 text-sm">Enter your household passcode to continue</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Input type="password" placeholder="Passcode" value={value} onChange={(e) => setValue(e.target.value)} autoFocus className={error ? "border-red-400 focus:ring-red-400" : ""} />
          {error && <p className="text-xs text-red-500 text-center">Incorrect passcode. Try again.</p>}
          <Button type="submit" className="w-full" disabled={loading || !value}>{loading ? "Checking…" : "Enter"}</Button>
        </form>
      </div>
    </div>
  );
}
