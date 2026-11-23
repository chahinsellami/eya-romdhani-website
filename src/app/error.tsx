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
      <h1 className="type-title">
        This page could not be displayed
      </h1>
      <p className="prose-editorial mt-4 text-[var(--text-secondary)]">
        The portfolio is temporarily unavailable. Reloading usually fixes it.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="button-solid">
          Try again
        </button>
        <Link
          href="/"
          className="button-quiet px-2"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
