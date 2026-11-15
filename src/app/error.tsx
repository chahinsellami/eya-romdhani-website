"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary.
 *
 * Any client exception that escapes a local boundary lands here instead of the
 * unbranded default screen, so the visitor keeps the site's typography and has a
 * way back.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow text-[var(--accent-primary)]">Something went wrong</p>
      <h1 className="display-title mt-4 text-[var(--text-primary)]">
        This page could not be displayed
      </h1>
      <p className="prose-editorial mt-4 text-[var(--text-secondary)]">
        The portfolio is temporarily unavailable. Reloading usually fixes it.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="cinematic-button">
          Try again
        </button>
        <Link
          href="/"
          className="link-underline px-2 py-3 text-[length:var(--step--1)] uppercase tracking-[0.28em] text-[var(--text-secondary)]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
