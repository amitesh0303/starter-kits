/**
 * Protected dashboard page.
 * Sections: manage workflows, view run history/retry status, and plan usage.
 */

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Automation Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Workflows</h2>
          <p className="text-gray-600 text-sm">
            Create and manage automated workflows and their triggers.
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Runs</h2>
          <p className="text-gray-600 text-sm">
            View run status and retry/step-attempt history for each run.
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Plan</h2>
          <p className="text-gray-600 text-sm">
            Track monthly run usage against your subscription&apos;s limit.
          </p>
        </section>
      </div>
    </main>
  );
}
