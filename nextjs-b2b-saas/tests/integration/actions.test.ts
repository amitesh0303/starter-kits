/**
 * Integration tests for core use-case actions.
 * Tests organization creation, role assignment, and customer creation workflows.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  InMemoryOrganizationRepository,
  InMemoryMembershipRepository,
  InMemoryCustomerRepository,
} from "@/lib/server/database";
import { canPerformAction, findActiveMembership } from "@/domain/policies";
import type { AuthContext } from "@/domain/policies";
import type { Membership } from "@/domain/entities";

describe("Core Actions Integration", () => {
  let orgRepo: InMemoryOrganizationRepository;
  let memberRepo: InMemoryMembershipRepository;
  let customerRepo: InMemoryCustomerRepository;

  beforeEach(() => {
    orgRepo = new InMemoryOrganizationRepository();
    memberRepo = new InMemoryMembershipRepository();
    customerRepo = new InMemoryCustomerRepository();
  });

  describe("Create Organization", () => {
    it("creates organization and adds creator as owner", async () => {
      const org = await orgRepo.create({
        name: "Acme Corp",
        slug: "acme-corp",
      });
      expect(org.id).toBeTruthy();
      expect(org.name).toBe("Acme Corp");

      const membership = await memberRepo.create({
        organizationId: org.id,
        userId: "user_1",
        email: "user@acme.com",
        role: "owner",
        status: "active",
        invitedBy: null,
      });
      expect(membership.role).toBe("owner");
      expect(membership.status).toBe("active");
    });

    it("created org can be found by slug", async () => {
      await orgRepo.create({ name: "Test Org", slug: "test-org" });
      const found = await orgRepo.findBySlug("test-org");
      expect(found).not.toBeNull();
      expect(found!.name).toBe("Test Org");
    });
  });

  describe("Assign Role", () => {
    it("owner can update member role to admin", async () => {
      const org = await orgRepo.create({ name: "Acme", slug: "acme" });

      // Create owner membership
      await memberRepo.create({
        organizationId: org.id,
        userId: "user_owner",
        email: "owner@acme.com",
        role: "owner",
        status: "active",
        invitedBy: null,
      });

      // Create member
      const member = await memberRepo.create({
        organizationId: org.id,
        userId: "user_member",
        email: "member@acme.com",
        role: "member",
        status: "active",
        invitedBy: "user_owner",
      });

      // Owner checks policy
      const ownerCtx: AuthContext = { userId: "user_owner" };
      const allMembers = await memberRepo.findByOrganization(org.id);
      const ownerMembership = findActiveMembership(ownerCtx, org.id, allMembers);
      expect(canPerformAction(ownerCtx, "member:update_role", ownerMembership)).toBe(true);

      // Perform role update
      const updated = await memberRepo.updateRole(member.id, "admin");
      expect(updated).not.toBeNull();
      expect(updated!.role).toBe("admin");
    });

    it("admin cannot update roles", async () => {
      const org = await orgRepo.create({ name: "Acme", slug: "acme" });

      await memberRepo.create({
        organizationId: org.id,
        userId: "user_admin",
        email: "admin@acme.com",
        role: "admin",
        status: "active",
        invitedBy: null,
      });

      const adminCtx: AuthContext = { userId: "user_admin" };
      const allMembers = await memberRepo.findByOrganization(org.id);
      const adminMembership = findActiveMembership(adminCtx, org.id, allMembers);
      expect(canPerformAction(adminCtx, "member:update_role", adminMembership)).toBe(false);
    });
  });

  describe("Create Customer", () => {
    it("admin can create a customer for the org", async () => {
      const org = await orgRepo.create({ name: "Acme", slug: "acme" });

      await memberRepo.create({
        organizationId: org.id,
        userId: "user_admin",
        email: "admin@acme.com",
        role: "admin",
        status: "active",
        invitedBy: null,
      });

      const adminCtx: AuthContext = { userId: "user_admin" };
      const allMembers = await memberRepo.findByOrganization(org.id);
      const adminMembership = findActiveMembership(adminCtx, org.id, allMembers);
      expect(canPerformAction(adminCtx, "customer:create", adminMembership)).toBe(true);

      const customer = await customerRepo.create({
        organizationId: org.id,
        paddleCustomerId: "ctm_test_123",
        email: "billing@acme.com",
      });
      expect(customer.id).toBeTruthy();
      expect(customer.paddleCustomerId).toBe("ctm_test_123");
    });

    it("member cannot create a customer", async () => {
      const org = await orgRepo.create({ name: "Acme", slug: "acme" });

      await memberRepo.create({
        organizationId: org.id,
        userId: "user_member",
        email: "member@acme.com",
        role: "member",
        status: "active",
        invitedBy: null,
      });

      const memberCtx: AuthContext = { userId: "user_member" };
      const allMembers = await memberRepo.findByOrganization(org.id);
      const memberMembership = findActiveMembership(memberCtx, org.id, allMembers);
      expect(canPerformAction(memberCtx, "customer:create", memberMembership)).toBe(false);
    });
  });
});
