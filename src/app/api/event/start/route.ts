import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-guards";

export async function POST() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { count } = await prisma.team.deleteMany({});

  await prisma.eventState.upsert({
    where: { id: 1 },
    update: { endedAt: null },
    create: { id: 1, endedAt: null },
  });

  return NextResponse.json({ teamsDeleted: count });
}
