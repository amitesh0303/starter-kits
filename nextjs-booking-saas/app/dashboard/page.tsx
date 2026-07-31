/**
 * Protected dashboard page.
 * Shows bookings, availability management, and payment history.
 */
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Booking Dashboard</h1>
        <Link
          href="/auth/signout"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Sign Out
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Upcoming Bookings</h2>
          <p className="text-gray-600 text-sm">
            View and manage your upcoming appointments and reservations.
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Availability</h2>
          <p className="text-gray-600 text-sm">
            Set your available time slots for each day of the week.
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Payments</h2>
          <p className="text-gray-600 text-sm">
            Track payment status and view transaction history.
          </p>
        </section>
      </div>
    </main>
  );
}
