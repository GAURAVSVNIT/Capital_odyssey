import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function NavBar() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-slate-900">
          Capital Odyssey
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          {session.user.role === "ADMIN" && (
            <>
              <Link href="/admin" className="hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/admin/teams" className="hover:text-slate-900">
                Teams
              </Link>
              <Link href="/admin/users" className="hover:text-slate-900">
                Moderators
              </Link>
            </>
          )}
          {session.user.role === "MODERATOR" && session.user.stationNumber != null && (
            <Link href={`/station/${session.user.stationNumber}`} className="hover:text-slate-900">
              My Station
            </Link>
          )}
          <span className="text-slate-400">{session.user.name}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="text-red-600 hover:text-red-700">
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
