import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-gray-200 p-4">
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/conversations"
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Conversations
          </Link>
          <Link
            href="/dashboard/generations"
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Usage
          </Link>
          <Link
            href="/dashboard/billing"
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Billing
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
