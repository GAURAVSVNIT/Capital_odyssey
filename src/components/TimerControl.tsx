"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/format";
import type { TimerStatus } from "@/lib/types";

export function TimerControl({
  status,
  remainingSeconds,
  onAction,
  busy,
}: {
  status: TimerStatus;
  remainingSeconds: number;
  onAction: (action: "start" | "pause" | "resume") => void | Promise<void>;
  busy?: boolean;
}) {
  const [display, setDisplay] = useState(remainingSeconds);

  useEffect(() => {
    setDisplay(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (status !== "RUNNING") return;
    const interval = setInterval(() => {
      setDisplay((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const expired = display <= 0;

  return (
    <div className="flex items-center gap-3">
      <span
        className={`font-mono text-lg tabular-nums ${
          expired
            ? "text-red-600"
            : status === "RUNNING"
              ? "text-emerald-600"
              : "text-slate-700"
        }`}
      >
        {formatDuration(display)}
      </span>

      {status === "NOT_STARTED" && (
        <button
          disabled={busy}
          onClick={() => onAction("start")}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Start
        </button>
      )}
      {status === "RUNNING" && (
        <button
          disabled={busy}
          onClick={() => onAction("pause")}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          Pause
        </button>
      )}
      {status === "PAUSED" && !expired && (
        <button
          disabled={busy}
          onClick={() => onAction("resume")}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Resume
        </button>
      )}
      {(status === "FINISHED" || expired) && (
        <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium uppercase tracking-wide text-red-600">
          Time up
        </span>
      )}
    </div>
  );
}
