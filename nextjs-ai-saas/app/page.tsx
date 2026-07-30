import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          AI Chat &amp; Content Generation
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Build intelligent applications with conversational AI. Powered by
          OpenAI-compatible APIs with usage tracking and subscription billing.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/sign-in"
            className="rounded-md bg-black px-6 py-3 text-white font-medium hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-md border border-gray-300 px-6 py-3 font-medium hover:bg-gray-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
