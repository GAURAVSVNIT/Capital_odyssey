import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session-guards";

export async function GET() {
  const guard = await requireUser();
  if ("error" in guard) return guard.error;

  const stations = await prisma.station.findMany({ orderBy: { number: "asc" } });
  return NextResponse.json(stations);
}
