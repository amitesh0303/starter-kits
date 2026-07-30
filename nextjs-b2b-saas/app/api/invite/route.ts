/**
 * Team invite endpoint.
 * Sends an invitation email via Postmark to join the organization.
 * Requires authenticated user with admin+ role.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getProviders } from "@/lib/server/providers";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/lib/server/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, organizationName, inviterName, organizationId } = body;

    if (!email || !organizationName || !inviterName || !organizationId) {
      throw new ValidationError("Missing required fields: email, organizationName, inviterName, organizationId");
    }

    // In production, verify the session and check RBAC policies here
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new AuthenticationError();
    }

    // In production, look up membership and check canInviteMembers policy
    const role = request.headers.get("x-user-role");
    if (!role || role === "member") {
      throw new AuthorizationError("Only admins and owners can invite members");
    }

    const { mail } = getProviders();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const inviteUrl = `${appUrl}/auth/callback?invite=${organizationId}`;

    await mail.sendInvite({
      to: email,
      inviterName,
      organizationName,
      inviteUrl,
    });

    return NextResponse.json({ sent: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(error.toSafeResponse(), { status: 401 });
    }
    if (error instanceof AuthorizationError) {
      return NextResponse.json(error.toSafeResponse(), { status: 403 });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json(error.toSafeResponse(), { status: 400 });
    }

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to send invite" } },
      { status: 500 }
    );
  }
}
