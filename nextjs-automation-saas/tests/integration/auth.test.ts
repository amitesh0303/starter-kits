/**
 * Integration tests for authentication and authorization flows.
 * Tests Clerk auth context building combined with domain policies.
 */

import { describe, it, expect } from "vitest";
import { buildAuthContext } from "@/lib/server/auth";
import {
  canCreateWorkflow,
  canEditWorkflow,
  canViewRun,
} from "@/domain/policies";
import type { Workflow } from "@/domain/entities";

describe("Auth Context Building", () => {
  it("returns null for null userId", () => {
    expect(buildAuthContext(null)).toBeNull();
  });

  it("returns null for empty string userId", () => {
    expect(buildAuthContext("")).toBeNull();
  });

  it("builds context for a valid userId", () => {
    expect(buildAuthContext("user_123")).toEqual({ userId: "user_123" });
  });
});

describe("Auth + Policy Integration", () => {
  const workflow: Workflow = {
    id: "wf_1",
    userId: "owner_1",
    name: "Test workflow",
    description: null,
    triggerType: "manual",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("unauthenticated user cannot create workflows", () => {
    const ctx = buildAuthContext(null);
    expect(canCreateWorkflow(ctx, 0, 5)).toBe(false);
  });

  it("authenticated user under plan limit can create a workflow", () => {
    const ctx = buildAuthContext("user_1");
    expect(canCreateWorkflow(ctx, 1, 5)).toBe(true);
  });

  it("owner can edit their own workflow", () => {
    const ctx = buildAuthContext("owner_1");
    expect(canEditWorkflow(ctx, workflow)).toBe(true);
  });

  it("non-owner cannot edit the workflow", () => {
    const ctx = buildAuthContext("someone_else");
    expect(canEditWorkflow(ctx, workflow)).toBe(false);
  });

  it("unauthenticated cannot view runs", () => {
    const ctx = buildAuthContext(null);
    expect(canViewRun(ctx, workflow)).toBe(false);
  });

  it("owner can view runs for their workflow", () => {
    const ctx = buildAuthContext("owner_1");
    expect(canViewRun(ctx, workflow)).toBe(true);
  });
});
