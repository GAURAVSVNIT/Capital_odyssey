"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function MobileNavToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-gold)] text-[var(--gold-bright)] sm:hidden"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <nav
        className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-4 border-b border-[var(--border-gold)] bg-[var(--bg-elevated)] px-4 py-4 text-sm text-[var(--text-muted)] sm:static sm:flex sm:flex-row sm:items-center sm:gap-5 sm:border-none sm:bg-transparent sm:p-0`}
      >
        {children}
      </nav>
    </>
  );
}
