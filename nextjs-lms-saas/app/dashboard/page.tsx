/**
 * Protected dashboard page.
 * Creators: manage courses and lessons.
 * Learners: view enrolled courses and progress.
 */

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Learning Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">My Courses</h2>
          <p className="text-gray-600 text-sm">
            View your enrolled courses and continue learning where you left off.
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Progress</h2>
          <p className="text-gray-600 text-sm">
            Track your completion percentage and lesson history.
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Subscription</h2>
          <p className="text-gray-600 text-sm">
            Manage your membership plan and billing details.
          </p>
        </section>
      </div>
    </main>
  );
}
