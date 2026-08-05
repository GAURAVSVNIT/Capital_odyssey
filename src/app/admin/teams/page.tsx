"use client";

import { useState, type FormEvent } from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/format";
import type { TeamSummary } from "@/lib/types";

export default function AdminTeamsPage() {
  const { data: teams, mutate } = useSWR<TeamSummary[]>("/api/teams", fetcher, { refreshInterval: 5000 });
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Team name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiRequest("/api/teams", "POST", { name: name.trim(), note: note.trim() || undefined });
      setName("");
      setNote("");
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, teamName: string) {
    if (!confirm(`Delete team "${teamName}"? This removes its full ledger too.`)) return;
    await apiRequest(`/api/teams/${id}`, "DELETE");
    mutate();
  }

  return (
    <div className="page">
      <Link href="/admin" className="link-muted text-xs">
        &larr; Back to dashboard
      </Link>
      <h1 className="mb-6 mt-2 font-display text-2xl font-semibold uppercase text-[var(--gold-bright)]">Teams</h1>

      <form onSubmit={handleCreate} className="card mb-8 p-4">
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-muted)]">Register a new team</h2>
        <div className="flex flex-wrap gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team name"
            className="input min-w-[10rem] flex-1"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="input min-w-[10rem] flex-1"
          />
          <button disabled={submitting} type="submit" className="btn-primary">
            Register
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </form>

      <div className="space-y-2">
        {teams?.map((team) => (
          <div key={team.id} className="card flex items-center justify-between px-4 py-3">
            <div>
              <Link href={`/admin/teams/${team.id}`} className="font-medium text-[var(--text)] hover:text-[var(--gold-bright)] hover:underline">
                {team.name}
              </Link>
              {team.note && <p className="text-xs text-[var(--text-muted)]">{team.note}</p>}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-[var(--gold-bright)]">{formatCurrency(team.balance)}</span>
              <button onClick={() => handleDelete(team.id, team.name)} className="text-xs text-red-400 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
        {teams?.length === 0 && <p className="text-sm text-[var(--text-muted)]">No teams yet.</p>}
      </div>
    </div>
  );
}
