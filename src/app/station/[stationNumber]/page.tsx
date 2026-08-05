import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StationTeamList } from "./StationTeamList";

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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">
        Station {station.number}: {station.name}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Search a team, manage their timer, and record cash adjustments for this station.
      </p>
      <StationTeamList stationId={station.id} />
    </div>
  );
}
