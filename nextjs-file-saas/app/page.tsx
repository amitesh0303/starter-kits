/**
 * Public landing page for File Conversion SaaS.
 */
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">File Conversion SaaS Starter</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
        Upload files, convert them to the format you need, and download the
        result. Uploads are validated for MIME type and size before ever
        touching storage, and every conversion job has a bounded number of
        retries with a recorded terminal outcome. Built with Next.js, Clerk,
        Neon, Drizzle, Cloudflare R2, Inngest, and Stripe.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}
