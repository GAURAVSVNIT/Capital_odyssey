import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, auth } from "@/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  const { error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        username: formData.get("username"),
        password: formData.get("password"),
        redirectTo: "/",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=invalid");
      }
      throw err;
    }
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 15%, rgba(212,175,55,0.16), transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gold-dim)]">
            Through strategy, rise to the top
          </p>
          <h1 className="font-display text-3xl font-bold uppercase leading-tight text-[var(--gold-bright)]">
            Capital
            <br />
            Odyssey
          </h1>
        </div>

        <div className="card p-8">
          <p className="mb-6 text-sm text-[var(--text-muted)]">Sign in to continue</p>

          {error && (
            <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              Invalid username or password.
            </p>
          )}

          <form action={login} className="space-y-4">
            <div>
              <label htmlFor="username" className="label">
                Username
              </label>
              <input id="username" name="username" type="text" required autoFocus className="input" />
            </div>
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input id="password" name="password" type="password" required className="input" />
            </div>
            <button type="submit" className="btn-primary w-full">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
