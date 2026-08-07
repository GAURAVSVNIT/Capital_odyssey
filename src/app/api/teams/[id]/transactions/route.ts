import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/session-guards";
import { isEventEnded } from "@/lib/event";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireUser();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const transactions = await prisma.transaction.findMany({
    where: { teamId: id },
    orderBy: { createdAt: "desc" },
    include: {
      station: { select: { number: true, name: true } },
      createdBy: { select: { username: true } },
    },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole("ADMIN", "MODERATOR", "BANKER");
  if ("error" in guard) return guard.error;
  const { session } = guard;

  if (session.user.role !== "ADMIN" && (await isEventEnded())) {
    return NextResponse.json({ error: "The event has ended; only an admin can make changes now" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);

  const amount = Number(body?.amount);
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount === 0) {
    return NextResponse.json({ error: "Amount must be a non-zero whole number" }, { status: 400 });
  }
  if (!note) {
    return NextResponse.json({ error: "A note describing the adjustment is required" }, { status: 400 });
  }

  let stationId: string | null;
  if (session.user.role === "MODERATOR" || session.user.role === "BANKER") {
    if (!session.user.stationId) {
      return NextResponse.json({ error: "Your account is not assigned to a station" }, { status: 403 });
    }
    stationId = session.user.stationId;
  } else {
    stationId = typeof body?.stationId === "string" && body.stationId ? body.stationId : null;
  }

  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      teamId: id,
      stationId,
      amount,
      note,
      createdById: session.user.id,
    },
    include: {
      station: { select: { number: true, name: true } },
      createdBy: { select: { username: true } },
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
