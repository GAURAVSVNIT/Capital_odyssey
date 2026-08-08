import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StationTeamList } from "./StationTeamList";
import { BiasedRandomGenerator } from "@/components/BiasedRandomGenerator";

export default async function StationPage({
  params,
}: {
  params: Promise<{ stationNumber: string }>;
}) {
  const { stationNumber } = await params;
  const number = Number(stationNumber);
  if (!Number.isInteger(number)) notFound();

  const station = await prisma.station.findUnique({ where: { number } });
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
        Search a team, manage their timer, and record cash adjustments for this station.
      </p>
      {station.number === 1 && <BiasedRandomGenerator />}
      <StationTeamList stationId={station.id} />
    </div>
  );
}
