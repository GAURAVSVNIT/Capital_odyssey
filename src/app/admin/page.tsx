"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { formatCurrency, formatDuration } from "@/lib/format";
import type { TeamSummary } from "@/lib/types";

const RANK_COLORS = ["#e8c766", "#c7c7d1", "#c98a4b"];

export default function AdminDashboardPage() {
  const { data: teams, error, isLoading } = useSWR<TeamSummary[]>("/api/teams", fetcher, {
    refreshInterval: 3000,
  });

  const sorted = teams ? [...teams].sort((a, b) => b.balance - a.balance) : [];

  return (
    <div className="page">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold uppercase text-[var(--gold-bright)]">Leaderboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/teams" className="btn-primary">
            Manage teams
          </Link>
          <Link href="/admin/users" className="btn-outline">
            Moderators
          </Link>
        </div>
      </div>

      {isLoading && <p className="text-sm text-[var(--text-muted)]">Loading teams…</p>}
      {error && <p className="text-sm text-red-400">Failed to load teams.</p>}
      {teams && teams.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">
          No teams registered yet.{" "}
          <Link href="/admin/teams" className="text-[var(--gold-bright)] underline">
            Register one
          </Link>
          .
        </p>
      )}

      {sorted.length > 0 && (
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Balance</th>
                <th>Timer</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((team, idx) => (
                <tr
                  key={team.id}
                  style={idx < 3 ? { background: "rgba(212, 175, 55, 0.07)" } : undefined}
                >
                  <td className="font-semibold" style={{ color: RANK_COLORS[idx] ?? "var(--text-muted)" }}>
                    {idx + 1}
                  </td>
                  <td>
                    <Link href={`/admin/teams/${team.id}`} className="font-medium text-[var(--text)] hover:text-[var(--gold-bright)] hover:underline">
                      {team.name}
                    </Link>
                  </td>
                  <td className="font-semibold text-[var(--gold-bright)]">{formatCurrency(team.balance)}</td>
                  <td>
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
    status === "RUNNING"
      ? "text-emerald-400"
      : status === "FINISHED" || remaining <= 0
        ? "text-red-400"
        : "text-[var(--text-muted)]";

  return (
    <span className={`font-mono text-xs ${color}`}>
      {formatDuration(remaining)} · {label}
    </span>
  );
}
