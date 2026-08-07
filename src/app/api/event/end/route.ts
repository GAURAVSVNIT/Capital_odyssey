import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-guards";
import { getEventState } from "@/lib/event";
import { LENDER_STATION_NUMBER, DEFAULT_LOAN_INTEREST_RATE_PERCENT, LOAN_COMPOUND_PERIODS } from "@/lib/constants";

const FALLBACK_RATE = DEFAULT_LOAN_INTEREST_RATE_PERCENT / 100;

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

  const settlements: {
    teamId: string;
    teamName: string;
    loans: number;
    principal: number;
    interest: number;
    totalDue: number;
  }[] = [];
  const now = new Date();

  for (const team of teams) {
    if (lenderStation) {
      const loans = await prisma.transaction.findMany({
        where: { teamId: team.id, stationId: lenderStation.id, amount: { gt: 0 } },
      });

      if (loans.length > 0) {
        let teamPrincipal = 0;
        let teamInterest = 0;
        let teamTotalDue = 0;

        for (const loan of loans) {
          const rate = loan.interestRate ?? FALLBACK_RATE;
          const totalDue = Math.round(loan.amount * (1 + rate) ** LOAN_COMPOUND_PERIODS);
          const interest = totalDue - loan.amount;

          await prisma.transaction.create({
            data: {
              teamId: team.id,
              stationId: lenderStation.id,
              amount: -totalDue,
              note: `Loan repayment: ₹${loan.amount.toLocaleString("en-IN")} principal + ₹${interest.toLocaleString(
                "en-IN",
              )} interest at ${(rate * 100).toFixed(1)}% × ${LOAN_COMPOUND_PERIODS} periods`,
              createdById: session.user.id,
            },
          });

          teamPrincipal += loan.amount;
          teamInterest += interest;
          teamTotalDue += totalDue;
        }

        settlements.push({
          teamId: team.id,
          teamName: team.name,
          loans: loans.length,
          principal: teamPrincipal,
          interest: teamInterest,
          totalDue: teamTotalDue,
        });
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
