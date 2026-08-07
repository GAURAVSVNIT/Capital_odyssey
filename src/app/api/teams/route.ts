import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/session-guards";
import { serializeTeam } from "@/lib/team-utils";

export async function GET() {
  const guard = await requireUser();
  if ("error" in guard) return guard.error;

  const [teams, sums] = await Promise.all([
    prisma.team.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.transaction.groupBy({ by: ["teamId"], _sum: { amount: true } }),
  ]);

  const sumMap = new Map(sums.map((s) => [s.teamId, s._sum.amount ?? 0]));

  return NextResponse.json(teams.map((team) => serializeTeam(team, sumMap.get(team.id) ?? 0)));
}

export async function POST(req: NextRequest) {
  const guard = await requireRole("ADMIN", "REGISTRAR");
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const note = typeof body?.note === "string" && body.note.trim() ? body.note.trim() : null;

  if (!name) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }

  try {
    const team = await prisma.team.create({ data: { name, note } });
    return NextResponse.json(serializeTeam(team, 0), { status: 201 });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json({ error: "A team with this name already exists" }, { status: 409 });
    }
    throw err;
  }
}
