/**
 * Public product landing page for Booking SaaS.
 */
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Booking SaaS Starter</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
        Streamline your appointment scheduling with integrated payments,
        calendar sync, and automated email notifications. Built with Next.js,
        Stripe, Google Calendar, and Resend.
      </p>
      <div className="flex gap-4">
        <Link
          href="/auth/signin"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}
