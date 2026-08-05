"use client";

import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/format";
import { TimerControl } from "./TimerControl";
import type { TeamSummary } from "@/lib/types";

export function TeamCard({
  team,
  onChanged,
  stationId,
}: {
  team: TeamSummary;
  onChanged: () => void;
  stationId?: string;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [timerBusy, setTimerBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTimerAction(action: "start" | "pause" | "resume") {
    setTimerBusy(true);
    setError(null);
    try {
      await apiRequest(`/api/teams/${team.id}/timer`, "POST", { action });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setTimerBusy(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed === 0) {
      setError("Enter a non-zero whole number amount");
      return;
    }
    if (!note.trim()) {
      setError("Add a short note for this adjustment");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiRequest(`/api/teams/${team.id}/transactions`, "POST", {
        amount: parsed,
        note: note.trim(),
        stationId,
      });
      setAmount("");
      setNote("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{team.name}</h3>
          {team.note && <p className="text-xs text-slate-500">{team.note}</p>}
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-slate-900">{formatCurrency(team.balance)}</div>
          <div className="text-xs text-slate-400">current balance</div>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <TimerControl
          status={team.timerStatus}
          remainingSeconds={team.timerRemainingSeconds}
          onAction={handleTimerAction}
          busy={timerBusy}
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Amount (± ₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. -5000"
            className="w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="min-w-[10rem] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for adjustment"
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
