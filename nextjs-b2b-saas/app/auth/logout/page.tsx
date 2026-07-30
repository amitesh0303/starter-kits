/**
 * Auth0 logout page.
 * In production, this clears the session and redirects to the Auth0 logout endpoint.
 */
import Link from "next/link";

export default function LogoutPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Signed Out</h1>
      <p className="text-gray-600 mb-6">You have been signed out successfully.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Return Home
      </Link>
    </main>
  );
}
