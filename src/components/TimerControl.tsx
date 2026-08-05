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
          expired ? "text-red-400" : status === "RUNNING" ? "text-[var(--gold-bright)]" : "text-[var(--text-muted)]"
        }`}
      >
        {formatDuration(display)}
      </span>

      {status === "NOT_STARTED" && (
        <button disabled={busy} onClick={() => onAction("start")} className="btn-primary px-3 py-1.5 text-xs">
          Start
        </button>
      )}
      {status === "RUNNING" && (
        <button disabled={busy} onClick={() => onAction("pause")} className="btn-outline px-3 py-1.5 text-xs">
          Pause
        </button>
      )}
      {status === "PAUSED" && !expired && (
        <button disabled={busy} onClick={() => onAction("resume")} className="btn-primary px-3 py-1.5 text-xs">
          Resume
        </button>
      )}
      {(status === "FINISHED" || expired) && (
        <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-medium uppercase tracking-wide text-red-300">
          Time up
        </span>
      )}
    </div>
  );
}
