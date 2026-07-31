/**
 * Protected dashboard page.
 * Shows organization overview, member management, and subscription status.
 */
export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Organization Dashboard</h1>
        <a
          href="/auth/logout"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Sign Out
        </a>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Organization</h2>
          <p className="text-gray-600 text-sm">
            Manage your organization settings and details.
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Team Members</h2>
          <p className="text-gray-600 text-sm">
            Invite members, assign roles (owner, admin, member).
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Subscription</h2>
          <p className="text-gray-600 text-sm">
            View billing status and manage your Paddle subscription.
          </p>
        </section>
      </div>
    </main>
  );
}
