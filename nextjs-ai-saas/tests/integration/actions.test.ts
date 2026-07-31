/**
 * Integration tests for core use-case actions.
 * Tests the generate response action with fake adapters.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { FakeAIAdapter } from "@/lib/server/ai-fake";
import { FakeBillingAdapter } from "@/lib/server/billing-fake";
import { canGenerate } from "@/domain/policies";
import type { Workspace, Entitlement } from "@/domain/entities";
import { AuthorizationError } from "@/lib/server/errors";

describe("Generate Response Action", () => {
  let ai: FakeAIAdapter;
  let billing: FakeBillingAdapter;

  const workspace: Workspace = {
    id: "ws_1",
    name: "Test Workspace",
    slug: "test-workspace",
    ownerId: "user_1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const activeEntitlement: Entitlement = {
    id: "ent_1",
    workspaceId: "ws_1",
    lemonSqueezyCustomerId: "cus_1",
    lemonSqueezySubscriptionId: "sub_1",
    lemonSqueezyVariantId: "var_1",
    status: "active",
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    ai = new FakeAIAdapter();
    billing = new FakeBillingAdapter();
  });

  async function generateResponse(params: {
    userId: string;
    workspace: Workspace;
    entitlement: Entitlement | null;
    messages: { role: "user" | "assistant" | "system"; content: string }[];
    model: string;
  }) {
    // Check authorization
    if (!canGenerate({ userId: params.userId }, params.workspace, params.entitlement)) {
      throw new AuthorizationError("Cannot generate: insufficient entitlement");
    }

    // Generate response
    const result = await ai.generateResponse({
      model: params.model,
      messages: params.messages,
    });

    return {
      content: result.content,
      usage: {
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        model: result.model,
      },
    };
  }

  it("generates a response for authorized user", async () => {
    const result = await generateResponse({
      userId: "user_1",
      workspace,
      entitlement: activeEntitlement,
      messages: [{ role: "user", content: "Hello" }],
      model: "gpt-4o-mini",
    });

    expect(result.content).toBe("This is a fake AI response for testing purposes.");
    expect(result.usage.promptTokens).toBe(10);
    expect(result.usage.completionTokens).toBe(20);
    expect(result.usage.model).toBe("gpt-4o-mini");
  });

  it("records AI call params", async () => {
    await generateResponse({
      userId: "user_1",
      workspace,
      entitlement: activeEntitlement,
      messages: [
        { role: "system", content: "You are helpful." },
        { role: "user", content: "Hello" },
      ],
      model: "gpt-4",
    });

    expect(ai.calls).toHaveLength(1);
    expect(ai.calls[0].model).toBe("gpt-4");
    expect(ai.calls[0].messages).toHaveLength(2);
  });

  it("throws AuthorizationError when entitlement is null", async () => {
    await expect(
      generateResponse({
        userId: "user_1",
        workspace,
        entitlement: null,
        messages: [{ role: "user", content: "Hello" }],
        model: "gpt-4o-mini",
      })
    ).rejects.toThrow(AuthorizationError);
  });

  it("throws AuthorizationError when entitlement is cancelled", async () => {
    const cancelledEnt = { ...activeEntitlement, status: "cancelled" as const };
    await expect(
      generateResponse({
        userId: "user_1",
        workspace,
        entitlement: cancelledEnt,
        messages: [{ role: "user", content: "Hello" }],
        model: "gpt-4o-mini",
      })
    ).rejects.toThrow(AuthorizationError);
  });

  it("throws AuthorizationError for non-owner", async () => {
    await expect(
      generateResponse({
        userId: "user_other",
        workspace,
        entitlement: activeEntitlement,
        messages: [{ role: "user", content: "Hello" }],
        model: "gpt-4o-mini",
      })
    ).rejects.toThrow(AuthorizationError);
  });

  it("billing adapter creates checkout independently", async () => {
    const url = await billing.createCheckout({
      workspaceId: "ws_1",
      customerEmail: "test@example.com",
      variantId: "variant_1",
      redirectUrl: "http://localhost:3000/dashboard/billing",
    });

    expect(url).toContain("lemonsqueezy.com");
  });
});
