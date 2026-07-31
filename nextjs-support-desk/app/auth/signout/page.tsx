/**
 * Sign-out page for Auth.js authentication.
 */
import Link from "next/link";

export default function SignOutPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign Out</h1>
        <p className="text-gray-600 text-center text-sm">
          You have been signed out of your account.
        </p>
        <div className="border rounded-lg p-6 space-y-4">
          <Link
            href="/api/auth/signout"
            className="block w-full px-4 py-2 text-center bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Confirm Sign Out
          </Link>
          <Link
            href="/dashboard"
            className="block w-full px-4 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
