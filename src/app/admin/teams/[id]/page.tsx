"use client";

import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/format";
import { STARTING_CASH } from "@/lib/constants";
import { TimerControl } from "@/components/TimerControl";
import { SignedAmountInput } from "@/components/SignedAmountInput";
import type { TeamSummary, TransactionEntry, StationSummary } from "@/lib/types";

export default function TeamLedgerPage() {
  const params = useParams<{ id: string }>();
  const teamId = params.id;

  const { data: team, mutate: mutateTeam } = useSWR<TeamSummary>(`/api/teams/${teamId}`, fetcher, {
    refreshInterval: 3000,
  });
  const { data: transactions, mutate: mutateTx } = useSWR<TransactionEntry[]>(
    `/api/teams/${teamId}/transactions`,
    fetcher,
    { refreshInterval: 3000 },
  );
  const { data: stations } = useSWR<StationSummary[]>("/api/stations", fetcher);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [stationId, setStationId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timerBusy, setTimerBusy] = useState(false);

  async function handleTimerAction(action: "start" | "pause" | "resume") {
    setTimerBusy(true);
    try {
      await apiRequest(`/api/teams/${teamId}/timer`, "POST", { action });
      mutateTeam();
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
      setError("Add a short note");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiRequest(`/api/teams/${teamId}/transactions`, "POST", {
        amount: parsed,
        note: note.trim(),
        stationId: stationId || undefined,
      });
      setAmount("");
      setNote("");
      mutateTeam();
      mutateTx();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add adjustment");
    } finally {
      setSubmitting(false);
    }
  }

  if (!team) {
    return <div className="page text-sm text-[var(--text-muted)]">Loading…</div>;
  }

  return (
    <div className="page">
      <Link href="/admin" className="link-muted text-xs">
        &larr; Back to dashboard
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--text)]">{team.name}</h1>
          {team.note && <p className="text-sm text-[var(--text-muted)]">{team.note}</p>}
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-[var(--gold-bright)]">{formatCurrency(team.balance)}</div>
          <div className="text-xs text-[var(--text-muted)]">current net worth</div>
        </div>
      </div>

      <div className="card mt-4 p-4">
        <TimerControl
          status={team.timerStatus}
          remainingSeconds={team.timerRemainingSeconds}
          onAction={handleTimerAction}
          busy={timerBusy}
        />
      </div>

      <form onSubmit={handleSubmit} className="card mt-4 p-4">
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-muted)]">Add adjustment</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="sm:w-44">
            <label className="label">Amount (₹)</label>
            <SignedAmountInput value={amount} onChange={setAmount} placeholder="e.g. 5000" />
          </div>
          <div>
            <label className="label">Station (optional)</label>
            <select value={stationId} onChange={(e) => setStationId(e.target.value)} className="input">
              <option value="">Final settlement / general</option>
              {stations?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.number}. {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:min-w-[12rem] sm:flex-1">
            <label className="label">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Investment returns revealed"
              className="input"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
            Add
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </form>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-[var(--text-muted)]">Ledger</h2>
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th className="hidden sm:table-cell">Station</th>
                <th>Note</th>
                <th className="hidden sm:table-cell">By</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-xs text-[var(--text-muted)]">—</td>
                <td className="hidden text-xs text-[var(--text-muted)] sm:table-cell">—</td>
                <td className="text-[var(--text-muted)]">Starting capital</td>
                <td className="hidden text-xs text-[var(--text-muted)] sm:table-cell">—</td>
                <td className="text-right font-medium text-[var(--text)]">{formatCurrency(STARTING_CASH)}</td>
              </tr>
              {transactions?.map((tx) => (
                <tr key={tx.id}>
                  <td className="text-xs text-[var(--text-muted)]">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="text-xs text-[var(--text-muted)]">
                    {tx.station ? `${tx.station.number}. ${tx.station.name}` : "—"}
                  </td>
                  <td>{tx.note}</td>
                  <td className="text-xs text-[var(--text-muted)]">{tx.createdBy?.username ?? "—"}</td>
                  <td className={`text-right font-medium ${tx.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {tx.amount >= 0 ? "+" : ""}
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
              {transactions?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-[var(--text-muted)]">
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
