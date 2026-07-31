/**
 * Protected dashboard page.
 * Sections: upload files, view conversions and their retry status, and
 * track storage quota usage.
 */

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">File Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Upload</h2>
          <p className="text-gray-600 text-sm">
            Upload a file for conversion. Files are validated for type and
            size before they are stored.
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Conversions</h2>
          <p className="text-gray-600 text-sm">
            View conversion job status, attempt history, and download
            completed outputs.
          </p>
        </section>

        <section className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Storage Quota</h2>
          <p className="text-gray-600 text-sm">
            Track how much of your plan&apos;s storage quota you have used.
          </p>
        </section>
      </div>
    </main>
  );
}
