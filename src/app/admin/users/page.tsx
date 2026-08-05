"use client";

import { useState, type FormEvent } from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetcher, apiRequest } from "@/lib/fetcher";
import type { ModeratorSummary, StationSummary } from "@/lib/types";

export default function AdminUsersPage() {
  const { data: users, mutate } = useSWR<ModeratorSummary[]>("/api/users", fetcher);
  const { data: stations } = useSWR<StationSummary[]>("/api/stations", fetcher);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [stationId, setStationId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiRequest("/api/users", "POST", { username: username.trim(), password, stationId });
      setUsername("");
      setPassword("");
      setStationId("");
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create moderator");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove moderator "${name}"?`)) return;
    await apiRequest(`/api/users/${id}`, "DELETE");
    mutate();
  }

  return (
    <div className="page max-w-2xl">
      <Link href="/admin" className="link-muted text-xs">
        &larr; Back to dashboard
      </Link>
      <h1 className="mb-6 mt-2 font-display text-2xl font-semibold uppercase text-[var(--gold-bright)]">
        Station Moderators
      </h1>

      <form onSubmit={handleCreate} className="card mb-8 p-4">
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-muted)]">Create a moderator account</h2>
        <div className="flex flex-wrap gap-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="input min-w-[8rem] flex-1"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="text"
            placeholder="Password"
            className="input min-w-[8rem] flex-1"
          />
          <select value={stationId} onChange={(e) => setStationId(e.target.value)} className="input">
            <option value="">Assign station…</option>
            {stations?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.number}. {s.name}
              </option>
            ))}
          </select>
          <button type="submit" disabled={submitting} className="btn-primary">
            Create
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </form>

      <div className="space-y-2">
        {users?.map((u) => (
          <div key={u.id} className="card flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-[var(--text)]">{u.username}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {u.station ? `Station ${u.station.number} · ${u.station.name}` : "No station assigned"}
              </p>
            </div>
            <button onClick={() => handleDelete(u.id, u.username)} className="text-xs text-red-400 hover:underline">
              Remove
            </button>
          </div>
        ))}
        {users?.length === 0 && <p className="text-sm text-[var(--text-muted)]">No moderators yet.</p>}
      </div>
    </div>
  );
}
