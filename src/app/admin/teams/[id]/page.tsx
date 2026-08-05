"use client";

import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/format";
import { STARTING_CASH } from "@/lib/constants";
import { TimerControl } from "@/components/TimerControl";
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
    return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-slate-500">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/admin" className="text-xs text-slate-500 hover:underline">
        &larr; Back to dashboard
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{team.name}</h1>
          {team.note && <p className="text-sm text-slate-500">{team.note}</p>}
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-slate-900">{formatCurrency(team.balance)}</div>
          <div className="text-xs text-slate-400">current net worth</div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <TimerControl
          status={team.timerStatus}
          remainingSeconds={team.timerRemainingSeconds}
          onAction={handleTimerAction}
          busy={timerBusy}
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Add adjustment</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Amount (± ₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-36 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Station (optional)</label>
            <select
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="">Final settlement / general</option>
              {stations?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.number}. {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[12rem] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Investment returns revealed"
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </form>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Ledger</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Station</th>
                <th className="px-4 py-2">Note</th>
                <th className="px-4 py-2">By</th>
                <th className="px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-2 text-slate-400" colSpan={4}>
                  Starting capital
                </td>
                <td className="px-4 py-2 text-right font-medium text-slate-700">{formatCurrency(STARTING_CASH)}</td>
              </tr>
              {transactions?.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-2 text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {tx.station ? `${tx.station.number}. ${tx.station.name}` : "—"}
                  </td>
                  <td className="px-4 py-2">{tx.note}</td>
                  <td className="px-4 py-2 text-xs text-slate-500">{tx.createdBy?.username ?? "—"}</td>
                  <td className={`px-4 py-2 text-right font-medium ${tx.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {tx.amount >= 0 ? "+" : ""}
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
              {transactions?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-slate-400">
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
