/**
 * Unit tests for deny-by-default authorization policies.
 */

import { describe, it, expect } from "vitest";
import { canAccessWorkspace, canManageWorkspace, canGenerate } from "@/domain/policies";
import type { Workspace, Entitlement } from "@/domain/entities";

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

describe("canAccessWorkspace", () => {
  it("allows workspace owner to access", () => {
    expect(canAccessWorkspace({ userId: "user_1" }, workspace)).toBe(true);
  });

  it("denies non-owner from accessing", () => {
    expect(canAccessWorkspace({ userId: "user_2" }, workspace)).toBe(false);
  });

  it("denies unauthenticated users (empty userId)", () => {
    expect(canAccessWorkspace({ userId: "" }, workspace)).toBe(false);
  });
});

describe("canManageWorkspace", () => {
  it("allows workspace owner to manage", () => {
    expect(canManageWorkspace({ userId: "user_1" }, workspace)).toBe(true);
  });

  it("denies non-owner from managing", () => {
    expect(canManageWorkspace({ userId: "user_2" }, workspace)).toBe(false);
  });

  it("denies unauthenticated users (empty userId)", () => {
    expect(canManageWorkspace({ userId: "" }, workspace)).toBe(false);
  });
});

describe("canGenerate", () => {
  it("allows owner with active entitlement", () => {
    expect(canGenerate({ userId: "user_1" }, workspace, activeEntitlement)).toBe(true);
  });

  it("allows owner with trialing entitlement", () => {
    const trialingEnt = { ...activeEntitlement, status: "trialing" as const };
    expect(canGenerate({ userId: "user_1" }, workspace, trialingEnt)).toBe(true);
  });

  it("denies owner with cancelled entitlement", () => {
    const cancelled = { ...activeEntitlement, status: "cancelled" as const };
    expect(canGenerate({ userId: "user_1" }, workspace, cancelled)).toBe(false);
  });

  it("denies owner with past_due entitlement", () => {
    const pastDue = { ...activeEntitlement, status: "past_due" as const };
    expect(canGenerate({ userId: "user_1" }, workspace, pastDue)).toBe(false);
  });

  it("denies non-owner even with active entitlement", () => {
    expect(canGenerate({ userId: "user_2" }, workspace, activeEntitlement)).toBe(false);
  });

  it("denies owner when no entitlement exists", () => {
    expect(canGenerate({ userId: "user_1" }, workspace, null)).toBe(false);
  });

  it("denies unauthenticated users", () => {
    expect(canGenerate({ userId: "" }, workspace, activeEntitlement)).toBe(false);
  });
});
