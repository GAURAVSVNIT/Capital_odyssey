import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session-guards";
import { serializeTeam, timerRemainingSeconds } from "@/lib/team-utils";

type Action = "start" | "pause" | "resume" | "finish";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireUser();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const action = body?.action as Action | undefined;

  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const now = new Date();

  if (action === "start") {
    if (team.timerStatus !== "NOT_STARTED") {
      return NextResponse.json({ error: "Timer has already been started" }, { status: 400 });
    }
    const updated = await prisma.team.update({
      where: { id },
      data: { timerStatus: "RUNNING", timerStartedAt: now, timerAccumulatedSeconds: 0 },
    });
    const sum = await prisma.transaction.aggregate({ where: { teamId: id }, _sum: { amount: true } });
    return NextResponse.json(serializeTeam(updated, sum._sum.amount ?? 0));
  }

  if (action === "pause" || action === "finish") {
    if (action === "pause" && team.timerStatus !== "RUNNING") {
      return NextResponse.json({ error: "Timer is not running" }, { status: 400 });
    }
    const elapsedSinceStart =
      team.timerStatus === "RUNNING" && team.timerStartedAt
        ? Math.floor((now.getTime() - team.timerStartedAt.getTime()) / 1000)
        : 0;
    const accumulated = Math.min(
      team.timerBudgetSeconds,
      team.timerAccumulatedSeconds + elapsedSinceStart,
    );
    const finished = action === "finish" || accumulated >= team.timerBudgetSeconds;
    const updated = await prisma.team.update({
      where: { id },
      data: {
        timerStatus: finished ? "FINISHED" : "PAUSED",
        timerStartedAt: null,
        timerAccumulatedSeconds: accumulated,
      },
    });
    const sum = await prisma.transaction.aggregate({ where: { teamId: id }, _sum: { amount: true } });
    return NextResponse.json(serializeTeam(updated, sum._sum.amount ?? 0));
  }

  if (action === "resume") {
    if (team.timerStatus !== "PAUSED") {
      return NextResponse.json({ error: "Timer is not paused" }, { status: 400 });
    }
    if (timerRemainingSeconds(team) <= 0) {
      return NextResponse.json({ error: "Timer has already finished" }, { status: 400 });
    }
    const updated = await prisma.team.update({
      where: { id },
      data: { timerStatus: "RUNNING", timerStartedAt: now },
    });
    const sum = await prisma.transaction.aggregate({ where: { teamId: id }, _sum: { amount: true } });
    return NextResponse.json(serializeTeam(updated, sum._sum.amount ?? 0));
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
