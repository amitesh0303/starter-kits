/**
 * Public product landing page for B2B SaaS.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">B2B SaaS Starter</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
        Multi-tenant organization management with role-based access control,
        team invitations, and subscription billing powered by Paddle.
      </p>
      <div className="flex gap-4">
        <a
          href="/auth/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </a>
        <a
          href="/dashboard"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Dashboard
        </a>
      </div>
    </main>
  );
}
