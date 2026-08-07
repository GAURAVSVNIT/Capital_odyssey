import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LENDER_STATION_NUMBER } from "@/lib/constants";
import { BankerTeamList } from "./BankerTeamList";

export default async function BankerPage() {
  const station = await prisma.station.findUnique({ where: { number: LENDER_STATION_NUMBER } });
  if (!station) notFound();

  return (
    <div className="page">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold-dim)]">
        Station {station.number}
      </p>
      <h1 className="mb-1 font-display text-2xl font-semibold uppercase text-[var(--gold-bright)]">
        {station.name}
      </h1>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Record loan principal (added to a team&rsquo;s balance) and interest (deducted) for each team.
      </p>
      <BankerTeamList stationId={station.id} />
    </div>
  );
}
