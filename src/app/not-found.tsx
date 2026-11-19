import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow !text-[var(--accent-primary)]">404 · Page Not Found</p>
      <h1 className="display-title mt-4 text-[var(--text-primary)]">
        This study could not be found
      </h1>
      <p className="prose-editorial mt-4 text-sm text-[var(--text-secondary)]">
        The requested page is unavailable or has moved. Return to the main portfolio.
      </p>
      <Link href="/" className="cinematic-button mt-8">
        Return to Portfolio
      </Link>
    </main>
  );
}
