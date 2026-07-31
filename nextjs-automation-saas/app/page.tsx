/**
 * Public landing page for Automation SaaS.
 */
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Automation SaaS Starter</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
        Build and run automated workflows on a schedule, webhook, or manual
        trigger. Every run is tracked step-by-step with bounded retries and a
        recorded terminal outcome. Built with Next.js, Clerk, Neon, Drizzle,
        Inngest, and Stripe.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}
