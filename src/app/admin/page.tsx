"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { formatCurrency, formatDuration } from "@/lib/format";
import type { TeamSummary } from "@/lib/types";

const RANK_COLORS = ["#e8c766", "#c7c7d1", "#c98a4b"];

type Settlement = { teamId: string; teamName: string; principal: number; interest: number; totalDue: number };

export default function AdminDashboardPage() {
  const { data: teams, error, isLoading, mutate } = useSWR<TeamSummary[]>("/api/teams", fetcher, {
    refreshInterval: 3000,
  });
  const { data: eventState, mutate: mutateEvent } = useSWR<{ endedAt: string | null }>("/api/event", fetcher, {
    refreshInterval: 5000,
  });

  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);
  const [settlements, setSettlements] = useState<Settlement[] | null>(null);

  const sorted = teams ? [...teams].sort((a, b) => b.balance - a.balance) : [];
  const eventEnded = eventState?.endedAt != null;

  async function handleEndEvent() {
    if (
      !confirm(
        "End the event now? This settles every team's outstanding bank loans (principal + 8% compound interest × 5), freezes all timers, and locks moderators/banker out of further changes. This cannot be undone.",
      )
    ) {
      return;
    }
    setEnding(true);
    setEndError(null);
    try {
      const result = await apiRequest<{ endedAt: string; settlements: Settlement[] }>("/api/event/end", "POST");
      setSettlements(result.settlements);
      mutateEvent();
      mutate();
    } catch (err) {
      setEndError(err instanceof Error ? err.message : "Failed to end the event");
    } finally {
      setEnding(false);
    }
  }

  return (
    <div className="page">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold uppercase text-[var(--gold-bright)]">Leaderboard</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/teams" className="btn-primary">
            Manage teams
          </Link>
          <Link href="/admin/users" className="btn-outline">
            Staff
          </Link>
          {eventEnded ? (
            <span className="flex items-center rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium uppercase tracking-wide text-red-300">
              Event ended{eventState?.endedAt ? ` · ${new Date(eventState.endedAt).toLocaleTimeString()}` : ""}
            </span>
          ) : (
            <button
              onClick={handleEndEvent}
              disabled={ending}
              className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-50"
            >
              {ending ? "Ending…" : "End Event"}
            </button>
          )}
        </div>
      </div>

      {endError && <p className="mb-4 text-sm text-red-400">{endError}</p>}

      {settlements && (
        <div className="card mb-6 p-4">
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-muted)]">Loan settlements applied</h2>
          {settlements.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No team had an outstanding bank loan.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {settlements.map((s) => (
                <li key={s.teamId} className="flex justify-between text-[var(--text)]">
                  <span>{s.teamName}</span>
                  <span className="text-red-400">
                    −{formatCurrency(s.totalDue)} ({formatCurrency(s.principal)} principal + {formatCurrency(s.interest)} interest)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
