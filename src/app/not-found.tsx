import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <h1 className="type-title">There&rsquo;s no page here</h1>
      <p className="prose-editorial mt-4">
        The link may be old or mistyped. The portfolio is on the home page.
      </p>
      <Link href="/" className="button-solid mt-8">
        Go to the portfolio
      </Link>
    </main>
  );
}
