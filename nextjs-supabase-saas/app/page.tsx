/**
 * Public product entry / landing page.
 * No authentication required to view this page.
 */

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="text-xl font-bold text-gray-900">SaaS Starter</div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Build your SaaS faster
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            A production-ready multi-tenant SaaS starter with authentication,
            team management, billing, and everything you need to launch your
            product.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/auth/signup"
              className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Start building
            </Link>
            <Link
              href="#features"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Learn more &rarr;
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Everything you need
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Multi-tenant architecture"
              description="Built-in tenant isolation with row-level security. Each team gets their own workspace."
            />
            <FeatureCard
              title="Authentication"
              description="Supabase Auth with email/password, magic links, and OAuth providers."
            />
            <FeatureCard
              title="Team management"
              description="Invite members, assign roles, and manage permissions with deny-by-default policies."
            />
            <FeatureCard
              title="Stripe billing"
              description="Subscription management with checkout, portal, and webhook handling built in."
            />
            <FeatureCard
              title="Email notifications"
              description="Welcome emails and team invites via Resend with a fake fallback for development."
            />
            <FeatureCard
              title="Type-safe"
              description="End-to-end TypeScript with strict mode. Typed config, entities, and error handling."
            />
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Simple pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-gray-600">
            One plan, everything included. No hidden fees.
          </p>
          <div className="mx-auto mt-12 max-w-sm rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
            <p className="mt-2 text-sm text-gray-600">
              Everything you need to build and ship your product.
            </p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-gray-900">$29</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            <ul className="mt-8 space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckIcon />
                Unlimited projects
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                Up to 10 team members
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                Priority support
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                All integrations
              </li>
            </ul>
            <Link
              href="/auth/signup"
              className="mt-8 block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          Built with Next.js, Supabase, Stripe, and Resend.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 text-blue-600"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}
