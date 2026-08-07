import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-guards";
import type { StaffRole } from "@/lib/types";

const STAFF_ROLES: StaffRole[] = ["MODERATOR", "BANKER", "REGISTRAR"];

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  try {
    await prisma.user.delete({ where: { id, role: { in: STAFF_ROLES } } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2025") {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    throw err;
  }
}
