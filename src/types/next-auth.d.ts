import { DefaultSession } from "next-auth";

declare module "@auth/core/types" {
  interface User {
    role: "ADMIN" | "MODERATOR";
    stationId: string | null;
    stationNumber: number | null;
  }

  interface Session {
    user: {
      role: "ADMIN" | "MODERATOR";
      stationId: string | null;
      stationNumber: number | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: "ADMIN" | "MODERATOR";
    stationId: string | null;
    stationNumber: number | null;
  }
}
