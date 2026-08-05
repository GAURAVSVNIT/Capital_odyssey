import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function NavBar() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <header className="border-b border-[var(--border-gold)] bg-[var(--bg-elevated)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-lg font-semibold uppercase text-[var(--gold-bright)]">
          Capital Odyssey
        </Link>
        <nav className="flex items-center gap-5 text-sm text-[var(--text-muted)]">
          {session.user.role === "ADMIN" && (
            <>
              <Link href="/admin" className="hover:text-[var(--gold-bright)]">
                Dashboard
              </Link>
              <Link href="/admin/teams" className="hover:text-[var(--gold-bright)]">
                Teams
              </Link>
              <Link href="/admin/users" className="hover:text-[var(--gold-bright)]">
                Moderators
              </Link>
            </>
          )}
          {session.user.role === "MODERATOR" && session.user.stationNumber != null && (
            <Link href={`/station/${session.user.stationNumber}`} className="hover:text-[var(--gold-bright)]">
              My Station
            </Link>
          )}
          <span className="text-[var(--gold-dim)]">{session.user.name}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="text-red-400 hover:text-red-300">
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
