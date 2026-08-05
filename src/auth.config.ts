import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.stationId = user.stationId;
        token.stationNumber = user.stationNumber;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role;
      session.user.stationId = token.stationId;
      session.user.stationNumber = token.stationNumber;
      return session;
    },
  },
} satisfies NextAuthConfig;
