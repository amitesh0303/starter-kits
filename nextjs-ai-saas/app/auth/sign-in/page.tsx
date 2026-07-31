export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        <p className="text-gray-600">
          Configure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable Clerk authentication.
        </p>
      </div>
    </div>
  );
}
