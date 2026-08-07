"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { LenderCard } from "@/components/LenderCard";
import type { TeamSummary } from "@/lib/types";

export function BankerTeamList({ stationId }: { stationId: string }) {
  const { data: teams, mutate, isLoading } = useSWR<TeamSummary[]>("/api/teams", fetcher, {
    refreshInterval: 3000,
  });
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!teams) return [];
    const q = search.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) => t.name.toLowerCase().includes(q));
  }, [teams, search]);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search team by name…"
        className="input mb-4"
      />

      {isLoading && <p className="text-sm text-[var(--text-muted)]">Loading teams…</p>}
      {teams && teams.length === 0 && <p className="text-sm text-[var(--text-muted)]">No teams registered yet.</p>}
      {teams && teams.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">No teams match &ldquo;{search}&rdquo;.</p>
      )}

      <div className="space-y-3">
        {filtered.map((team) => (
          <LenderCard key={team.id} team={team} stationId={stationId} onChanged={() => mutate()} />
        ))}
      </div>
    </div>
  );
}
