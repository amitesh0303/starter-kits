/**
 * Sign-in page for Auth.js authentication.
 */
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <p className="text-gray-600 text-center text-sm">
          Sign in to create and manage your support tickets.
        </p>
        <div className="border rounded-lg p-6 space-y-4">
          <p className="text-sm text-gray-500 text-center">
            Auth.js handles sign-in via configured providers (Google, GitHub, email, etc.)
          </p>
          <Link
            href="/api/auth/signin"
            className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue with Auth.js
          </Link>
        </div>
        <p className="text-xs text-gray-400 text-center">
          <Link href="/" className="hover:text-gray-600">Back to home</Link>
        </p>
      </div>
    </main>
  );
}
