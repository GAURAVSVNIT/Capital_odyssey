import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/session-guards";
import { serializeTeam } from "@/lib/team-utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireUser();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const [team, sum] = await Promise.all([
    prisma.team.findUnique({ where: { id } }),
    prisma.transaction.aggregate({ where: { teamId: id }, _sum: { amount: true } }),
  ]);

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(serializeTeam(team, sum._sum.amount ?? 0));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const data: { name?: string; note?: string | null } = {};

  if (typeof body?.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "Team name cannot be empty" }, { status: 400 });
    data.name = name;
  }
  if (typeof body?.note === "string") {
    data.note = body.note.trim() || null;
  }

  try {
    const team = await prisma.team.update({ where: { id }, data });
    const sum = await prisma.transaction.aggregate({ where: { teamId: id }, _sum: { amount: true } });
    return NextResponse.json(serializeTeam(team, sum._sum.amount ?? 0));
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json({ error: "A team with this name already exists" }, { status: 409 });
    }
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2025") {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  try {
    await prisma.team.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2025") {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
    throw err;
  }
}
