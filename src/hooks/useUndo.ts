"use client";
import * as React from "react";

export function useUndo<T>(initial: T) {
  const [state, setState] = React.useState<T>(initial);
  const [history, setHistory] = React.useState<T[]>([]);

  const set = React.useCallback((next: T) => {
    setHistory((h) => [...h.slice(-9), state]);
    setState(next);
  }, [state]);

  const undo = React.useCallback(() => {
    if (history.length === 0) return;
    setState(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  }, [history]);

  const canUndo = history.length > 0;

  return { state, set, undo, canUndo };
}
