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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/admin" className="text-xs text-slate-500 hover:underline">
        &larr; Back to dashboard
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold text-slate-900">Station Moderators</h1>

      <form onSubmit={handleCreate} className="mb-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Create a moderator account</h2>
        <div className="flex flex-wrap gap-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="min-w-[8rem] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="text"
            placeholder="Password"
            className="min-w-[8rem] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <select
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">Assign station…</option>
            {stations?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.number}. {s.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Create
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </form>

      <div className="space-y-2">
        {users?.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium text-slate-900">{u.username}</p>
              <p className="text-xs text-slate-500">
                {u.station ? `Station ${u.station.number} · ${u.station.name}` : "No station assigned"}
              </p>
            </div>
            <button onClick={() => handleDelete(u.id, u.username)} className="text-xs text-red-600 hover:underline">
              Remove
            </button>
          </div>
        ))}
        {users?.length === 0 && <p className="text-sm text-slate-500">No moderators yet.</p>}
      </div>
    </div>
  );
}
