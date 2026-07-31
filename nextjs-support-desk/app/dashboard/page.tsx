/**
 * Protected dashboard page.
 * Customers see their tickets, agents see the team queue.
 */
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Support Dashboard</h1>
        <Link
          href="/auth/signout"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Sign Out
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">My Tickets</h2>
          <p className="text-gray-600 text-sm">
            View and manage your support tickets. Track status and replies.
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Team Queue</h2>
          <p className="text-gray-600 text-sm">
            Agent view: see all team tickets, assign, and manage priority.
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Create Ticket</h2>
          <p className="text-gray-600 text-sm">
            Open a new support request with optional file attachments.
          </p>
        </section>
      </div>
    </main>
  );
}
