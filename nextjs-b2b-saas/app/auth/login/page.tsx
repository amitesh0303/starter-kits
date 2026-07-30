/**
 * Auth0 login page.
 * In production, this redirects to the Auth0 Universal Login page.
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      <p className="text-gray-600 mb-6">
        Sign in with your Auth0 account to access your organization.
      </p>
      <a
        href="/api/auth/login"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Continue with Auth0
      </a>
    </main>
  );
}
