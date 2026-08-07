import { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/types";

declare module "@auth/core/types" {
  interface User {
    role: UserRole;
    stationId: string | null;
    stationNumber: number | null;
  }

  interface Session {
    user: {
      role: UserRole;
      stationId: string | null;
      stationNumber: number | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: UserRole;
    stationId: string | null;
    stationNumber: number | null;
  }
}
