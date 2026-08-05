"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { formatCurrency, formatDuration } from "@/lib/format";
import type { TeamSummary } from "@/lib/types";

export default function AdminDashboardPage() {
  const { data: teams, error, isLoading } = useSWR<TeamSummary[]>("/api/teams", fetcher, {
    refreshInterval: 3000,
  });

  const sorted = teams ? [...teams].sort((a, b) => b.balance - a.balance) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Leaderboard</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/teams"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Manage teams
          </Link>
          <Link
            href="/admin/users"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Moderators
          </Link>
        </div>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading teams…</p>}
      {error && <p className="text-sm text-red-600">Failed to load teams.</p>}
      {teams && teams.length === 0 && (
        <p className="text-sm text-slate-500">
          No teams registered yet.{" "}
          <Link href="/admin/teams" className="underline">
            Register one
          </Link>
          .
        </p>
      )}

      {sorted.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Timer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((team, idx) => (
                <tr key={team.id} className={idx < 3 ? "bg-amber-50/60" : undefined}>
                  <td className="px-4 py-3 font-medium text-slate-700">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/teams/${team.id}`} className="font-medium text-slate-900 hover:underline">
                      {team.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(team.balance)}</td>
                  <td className="px-4 py-3">
                    <TimerBadge status={team.timerStatus} remaining={team.timerRemainingSeconds} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TimerBadge({ status, remaining }: { status: TeamSummary["timerStatus"]; remaining: number }) {
  const label =
    status === "NOT_STARTED"
      ? "Not started"
      : status === "RUNNING"
        ? "Running"
        : status === "PAUSED"
          ? "Paused"
          : "Finished";
  const color =
    status === "RUNNING" ? "text-emerald-600" : status === "FINISHED" || remaining <= 0 ? "text-red-600" : "text-slate-500";

  return (
    <span className={`font-mono text-xs ${color}`}>
      {formatDuration(remaining)} · {label}
    </span>
  );
}
