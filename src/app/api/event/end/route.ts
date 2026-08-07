import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-guards";
import { getEventState } from "@/lib/event";
import { LENDER_STATION_NUMBER, LOAN_INTEREST_RATE, LOAN_COMPOUND_PERIODS } from "@/lib/constants";

export async function POST() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { session } = guard;

  const state = await getEventState();
  if (state.endedAt) {
    return NextResponse.json({ error: "The event has already ended" }, { status: 400 });
  }

  const lenderStation = await prisma.station.findUnique({ where: { number: LENDER_STATION_NUMBER } });
  const teams = await prisma.team.findMany();

  const settlements: { teamId: string; teamName: string; principal: number; interest: number; totalDue: number }[] = [];
  const now = new Date();

  for (const team of teams) {
    if (lenderStation) {
      const principalAgg = await prisma.transaction.aggregate({
        where: { teamId: team.id, stationId: lenderStation.id, amount: { gt: 0 } },
        _sum: { amount: true },
      });
      const principal = principalAgg._sum.amount ?? 0;

      if (principal > 0) {
        const totalDue = Math.round(principal * (1 + LOAN_INTEREST_RATE) ** LOAN_COMPOUND_PERIODS);
        const interest = totalDue - principal;

        await prisma.transaction.create({
          data: {
            teamId: team.id,
            stationId: lenderStation.id,
            amount: -totalDue,
            note: `Loan settlement: ₹${principal.toLocaleString("en-IN")} principal + ₹${interest.toLocaleString(
              "en-IN",
            )} compound interest (8% × 5) at final settlement`,
            createdById: session.user.id,
          },
        });

        settlements.push({ teamId: team.id, teamName: team.name, principal, interest, totalDue });
      }
    }

    if (team.timerStatus !== "FINISHED") {
      const elapsedSinceStart =
        team.timerStatus === "RUNNING" && team.timerStartedAt
          ? Math.floor((now.getTime() - team.timerStartedAt.getTime()) / 1000)
          : 0;
      const accumulated = Math.min(team.timerBudgetSeconds, team.timerAccumulatedSeconds + elapsedSinceStart);
      await prisma.team.update({
        where: { id: team.id },
        data: { timerStatus: "FINISHED", timerStartedAt: null, timerAccumulatedSeconds: accumulated },
      });
    }
  }

  await prisma.eventState.update({ where: { id: 1 }, data: { endedAt: now } });

  return NextResponse.json({ endedAt: now.toISOString(), settlements });
}
