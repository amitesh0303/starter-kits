import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for route protection using Auth0.
 * In production, this integrates with @auth0/nextjs-auth0 middleware.
 * Protected routes require an active session; unprotected routes pass through.
 */

const protectedPaths = ["/dashboard"];

function isProtectedRoute(pathname: string): boolean {
  return protectedPaths.some((path) => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth0 handles session validation via its own middleware.
  // This layer adds path-based protection logic.
  if (isProtectedRoute(pathname)) {
    // In a real deployment, @auth0/nextjs-auth0 middleware validates the session.
    // If no session cookie exists, redirect to login.
    const sessionCookie = request.cookies.get("appSession");
    if (!sessionCookie) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
