"use client";

import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/format";
import { TimerControl } from "./TimerControl";
import type { TeamSummary } from "@/lib/types";

export function LenderCard({
  team,
  onChanged,
  stationId,
}: {
  team: TeamSummary;
  onChanged: () => void;
  stationId: string;
}) {
  const [principal, setPrincipal] = useState("");
  const [interest, setInterest] = useState("");
  const [submittingPrincipal, setSubmittingPrincipal] = useState(false);
  const [submittingInterest, setSubmittingInterest] = useState(false);
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

  function parsePositiveAmount(raw: string) {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
      return null;
    }
    return parsed;
  }

  async function handleAddPrincipal(e: FormEvent) {
    e.preventDefault();
    const amount = parsePositiveAmount(principal);
    if (amount === null) {
      setError("Enter a positive whole number for the principal");
      return;
    }
    setSubmittingPrincipal(true);
    setError(null);
    try {
      await apiRequest(`/api/teams/${team.id}/transactions`, "POST", {
        amount,
        note: "Loan principal disbursed",
        stationId,
      });
      setPrincipal("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmittingPrincipal(false);
    }
  }

  async function handleAddInterest(e: FormEvent) {
    e.preventDefault();
    const amount = parsePositiveAmount(interest);
    if (amount === null) {
      setError("Enter a positive whole number for the interest");
      return;
    }
    setSubmittingInterest(true);
    setError(null);
    try {
      await apiRequest(`/api/teams/${team.id}/transactions`, "POST", {
        amount: -amount,
        note: "Loan interest charged",
        stationId,
      });
      setInterest("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmittingInterest(false);
    }
  }

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-[var(--text)]">{team.name}</h3>
          {team.note && <p className="text-xs text-[var(--text-muted)]">{team.note}</p>}
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-[var(--gold-bright)]">{formatCurrency(team.balance)}</div>
          <div className="text-xs text-[var(--text-muted)]">current balance</div>
        </div>
      </div>

      <div className="mt-3 border-t border-[var(--border-gold)] pt-3">
        <TimerControl
          status={team.timerStatus}
          remainingSeconds={team.timerRemainingSeconds}
          onAction={handleTimerAction}
          busy={timerBusy}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 border-t border-[var(--border-gold)] pt-3 sm:grid-cols-2">
        <form onSubmit={handleAddPrincipal} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label">Principal (₹)</label>
            <input
              type="number"
              min="1"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="e.g. 20000"
              className="input py-1.5"
            />
          </div>
          <button type="submit" disabled={submittingPrincipal} className="btn-primary w-full py-1.5 sm:w-auto">
            Add Principal
          </button>
        </form>

        <form onSubmit={handleAddInterest} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label">Interest (₹)</label>
            <input
              type="number"
              min="1"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="e.g. 2000"
              className="input py-1.5"
            />
          </div>
          <button type="submit" disabled={submittingInterest} className="btn-outline w-full py-1.5 sm:w-auto">
            Add Interest
          </button>
        </form>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
