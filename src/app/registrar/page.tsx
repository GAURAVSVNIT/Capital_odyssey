"use client";

import { useState, type FormEvent } from "react";
import useSWR from "swr";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/format";
import type { TeamSummary } from "@/lib/types";

export default function RegistrarPage() {
  const { data: teams, mutate } = useSWR<TeamSummary[]>("/api/teams", fetcher, { refreshInterval: 5000 });
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  return (
    <div className="page">
      <h1 className="mb-1 font-display text-2xl font-semibold uppercase text-[var(--gold-bright)]">
        Team Registration
      </h1>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Register each team as they arrive. You can fix a name or note afterward, but deleting a team is admin-only.
      </p>

      <form onSubmit={handleCreate} className="card mb-8 p-4">
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-muted)]">Register a new team</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team name"
            className="input sm:min-w-[10rem] sm:flex-1"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="input sm:min-w-[10rem] sm:flex-1"
          />
          <button disabled={submitting} type="submit" className="btn-primary w-full sm:w-auto">
            Register
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </form>

      <div className="space-y-2">
        {teams?.map((team) =>
          editingId === team.id ? (
            <EditTeamRow
              key={team.id}
              team={team}
              onDone={() => {
                setEditingId(null);
                mutate();
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={team.id} className="card flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="font-medium text-[var(--text)]">{team.name}</p>
                {team.note && <p className="text-xs text-[var(--text-muted)]">{team.note}</p>}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-[var(--gold-bright)]">{formatCurrency(team.balance)}</span>
                <button onClick={() => setEditingId(team.id)} className="text-xs text-[var(--gold-bright)] hover:underline">
                  Edit
                </button>
              </div>
            </div>
          ),
        )}
        {teams?.length === 0 && <p className="text-sm text-[var(--text-muted)]">No teams registered yet.</p>}
      </div>
    </div>
  );
}

function EditTeamRow({
  team,
  onDone,
  onCancel,
}: {
  team: TeamSummary;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(team.name);
  const [note, setNote] = useState(team.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Team name cannot be empty");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await apiRequest(`/api/teams/${team.id}`, "PATCH", { name: name.trim(), note: note.trim() });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
      <div className="sm:min-w-[10rem] sm:flex-1">
        <label className="label">Team name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
      </div>
      <div className="sm:min-w-[10rem] sm:flex-1">
        <label className="label">Note</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="input" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1 sm:flex-none">
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn-outline flex-1 sm:flex-none">
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-red-400 sm:basis-full">{error}</p>}
    </form>
  );
}
