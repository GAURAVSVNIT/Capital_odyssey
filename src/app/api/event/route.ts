import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session-guards";
import { getEventState } from "@/lib/event";

export async function GET() {
  const guard = await requireUser();
  if ("error" in guard) return guard.error;

  const state = await getEventState();
  return NextResponse.json({ endedAt: state.endedAt });
}
