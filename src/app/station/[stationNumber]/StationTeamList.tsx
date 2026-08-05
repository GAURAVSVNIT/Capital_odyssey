"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { TeamCard } from "@/components/TeamCard";
import type { TeamSummary } from "@/lib/types";

export function StationTeamList({ stationId }: { stationId: string }) {
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
        className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />

      {isLoading && <p className="text-sm text-slate-500">Loading teams…</p>}
      {teams && teams.length === 0 && <p className="text-sm text-slate-500">No teams registered yet.</p>}
      {teams && teams.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-slate-500">No teams match &ldquo;{search}&rdquo;.</p>
      )}

      <div className="space-y-3">
        {filtered.map((team) => (
          <TeamCard key={team.id} team={team} stationId={stationId} onChanged={() => mutate()} />
        ))}
      </div>
    </div>
  );
}
