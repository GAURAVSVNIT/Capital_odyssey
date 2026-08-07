import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-guards";
import { LENDER_STATION_NUMBER } from "@/lib/constants";
import type { StaffRole } from "@/lib/types";

const STAFF_ROLES: StaffRole[] = ["MODERATOR", "BANKER", "REGISTRAR"];

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const users = await prisma.user.findMany({
    where: { role: { in: STAFF_ROLES } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      station: { select: { number: true, name: true } },
    },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = typeof body?.role === "string" ? body.role : "";
  const requestedStationId = typeof body?.stationId === "string" ? body.stationId : "";

  if (!username || username.length < 3) {
    return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  if (!STAFF_ROLES.includes(role as StaffRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  let stationId: string | null = null;

  if (role === "MODERATOR") {
    if (!requestedStationId) {
      return NextResponse.json({ error: "A station must be assigned" }, { status: 400 });
    }
    const station = await prisma.station.findUnique({ where: { id: requestedStationId } });
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }
    if (station.number === LENDER_STATION_NUMBER) {
      return NextResponse.json(
        { error: "The Lender station is reserved for Banker accounts" },
        { status: 400 },
      );
    }
    stationId = station.id;
  } else if (role === "BANKER") {
    const lenderStation = await prisma.station.findUnique({ where: { number: LENDER_STATION_NUMBER } });
    if (!lenderStation) {
      return NextResponse.json({ error: "The Lender station has not been seeded" }, { status: 500 });
    }
    stationId = lenderStation.id;
  }
  // REGISTRAR: stationId stays null

  try {
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: await bcrypt.hash(password, 10),
        role: role as StaffRole,
        stationId,
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        station: { select: { number: true, name: true } },
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json({ error: "That username is already taken" }, { status: 409 });
    }
    throw err;
  }
}
