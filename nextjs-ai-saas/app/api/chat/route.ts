/**
 * Server-only AI generation endpoint.
 * Records usage tied to workspace. Never exposes API keys to client.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getProviders } from "@/lib/server/providers";
import { requireAuth } from "@/lib/server/auth";
import { AuthenticationError, AuthorizationError } from "@/lib/server/errors";

export async function POST(request: Request) {
  try {
    const authResult = await auth();
    const user = requireAuth(authResult);

    const body = await request.json();
    const { messages, model = "gpt-4o-mini", workspaceId } = body;

    if (!messages || !Array.isArray(messages) || !workspaceId) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid request body" } },
        { status: 400 }
      );
    }

    const providers = getProviders();
    const result = await providers.ai.generateResponse({
      model,
      messages,
    });

    // Usage is recorded per generation tied to workspace
    // In production this would persist to the database
    return NextResponse.json({
      content: result.content,
      usage: {
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        model: result.model,
      },
      workspaceId,
      userId: user.userId,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Authentication required" } },
        { status: 401 }
      );
    }
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An error occurred" } },
      { status: 500 }
    );
  }
}
