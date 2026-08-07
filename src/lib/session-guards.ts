import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { UserRole } from "@/lib/types";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }
  return { session } as const;
}

export async function requireRole(...roles: UserRole[]) {
  const result = await requireUser();
  if ("error" in result) return result;
  if (!roles.includes(result.session.user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) } as const;
  }
  return result;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}
