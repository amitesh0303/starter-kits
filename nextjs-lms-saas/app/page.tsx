/**
 * Public course catalog landing page for LMS SaaS.
 */
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">LMS SaaS Starter</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
        Create and sell online courses with video streaming, membership
        subscriptions, and progress tracking. Built with Next.js, Clerk, Mux,
        Stripe, and UploadThing.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Browse Courses
        </Link>
      </div>
    </main>
  );
}
