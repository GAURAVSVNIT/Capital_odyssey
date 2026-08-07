"use client";

import { useMemo, useState, type FormEvent } from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { LENDER_STATION_NUMBER } from "@/lib/constants";
import type { StaffRole, StaffSummary, StationSummary } from "@/lib/types";

const ROLE_LABELS: Record<StaffRole, string> = {
  MODERATOR: "Station Moderator",
  BANKER: "Banker",
  REGISTRAR: "Team Registrator",
};

export default function AdminUsersPage() {
  const { data: users, mutate } = useSWR<StaffSummary[]>("/api/users", fetcher);
  const { data: stations } = useSWR<StationSummary[]>("/api/stations", fetcher);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("MODERATOR");
  const [stationId, setStationId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const moderatorStations = useMemo(
    () => stations?.filter((s) => s.number !== LENDER_STATION_NUMBER) ?? [],
    [stations],
  );

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiRequest("/api/users", "POST", {
        username: username.trim(),
        password,
        role,
        stationId: role === "MODERATOR" ? stationId : undefined,
      });
      setUsername("");
      setPassword("");
      setStationId("");
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove account "${name}"?`)) return;
    await apiRequest(`/api/users/${id}`, "DELETE");
    mutate();
  }

  return (
    <div className="page max-w-2xl">
      <Link href="/admin" className="link-muted text-xs">
        &larr; Back to dashboard
      </Link>
      <h1 className="mb-6 mt-2 font-display text-2xl font-semibold uppercase text-[var(--gold-bright)]">Staff</h1>

      <form onSubmit={handleCreate} className="card mb-8 p-4">
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-muted)]">Create a staff account</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="input sm:min-w-[8rem] sm:flex-1"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="text"
            placeholder="Password"
            className="input sm:min-w-[8rem] sm:flex-1"
          />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value as StaffRole);
              setStationId("");
            }}
            className="input"
          >
            <option value="MODERATOR">Station Moderator</option>
            <option value="BANKER">Banker</option>
            <option value="REGISTRAR">Team Registrator</option>
          </select>

          {role === "MODERATOR" && (
            <select value={stationId} onChange={(e) => setStationId(e.target.value)} className="input">
              <option value="">Assign station…</option>
              {moderatorStations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.number}. {s.name}
                </option>
              ))}
            </select>
          )}
          {role === "BANKER" && (
            <p className="flex items-center text-xs text-[var(--text-muted)]">
              Assigned automatically to Station 7 · The Lender
            </p>
          )}
          {role === "REGISTRAR" && (
            <p className="flex items-center text-xs text-[var(--text-muted)]">No station needed</p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
            Create
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </form>

      <div className="space-y-2">
        {users?.map((u) => (
          <div key={u.id} className="card flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div>
              <p className="font-medium text-[var(--text)]">{u.username}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {ROLE_LABELS[u.role]}
                {u.station ? ` · Station ${u.station.number} · ${u.station.name}` : ""}
              </p>
            </div>
            <button onClick={() => handleDelete(u.id, u.username)} className="text-xs text-red-400 hover:underline">
              Remove
            </button>
          </div>
        ))}
        {users?.length === 0 && <p className="text-sm text-[var(--text-muted)]">No staff accounts yet.</p>}
      </div>
    </div>
  );
}
