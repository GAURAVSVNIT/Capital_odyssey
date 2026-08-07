"use client";

import { useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { apiRequest } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/format";
import { useEventEnded } from "@/lib/hooks";
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
  const { data: session } = useSession();
  const eventEnded = useEventEnded();
  const locked = eventEnded && session?.user?.role !== "ADMIN";

  const [principal, setPrincipal] = useState("");
  const [submittingPrincipal, setSubmittingPrincipal] = useState(false);
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

  async function handleAddPrincipal(e: FormEvent) {
    e.preventDefault();
    const amount = Number(principal);
    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) {
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
          busy={timerBusy || locked}
        />
      </div>

      <form onSubmit={handleAddPrincipal} className="mt-3 flex flex-col gap-2 border-t border-[var(--border-gold)] pt-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Principal (₹)</label>
          <input
            type="number"
            min="1"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. 20000"
            disabled={locked}
            className="input py-1.5"
          />
        </div>
        <button
          type="submit"
          disabled={submittingPrincipal || locked}
          className="btn-primary w-full py-1.5 sm:w-auto"
        >
          Add Principal
        </button>
      </form>

      {locked && (
        <p className="mt-2 text-xs text-[var(--gold-dim)]">
          The event has ended. Loans are now settled automatically — only an admin can make further changes.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
