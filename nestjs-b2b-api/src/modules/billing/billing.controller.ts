import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { BillingService } from "./billing.service";

@Controller("billing")
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Post("checkout")
  createCheckout(@Body() body: { tenantId: string; plan: string }) {
    return this.billingService.createCheckoutSession(body.tenantId, body.plan);
  }

  @Get("subscription/:tenantId")
  getSubscription(@Param("tenantId") tenantId: string) {
    return this.billingService.getSubscription(tenantId);
  }
}
