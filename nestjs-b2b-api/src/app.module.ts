import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { BillingModule } from "./modules/billing/billing.module";
import { QueueModule } from "./modules/queue/queue.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [AuthModule, TenantsModule, BillingModule, QueueModule],
  controllers: [HealthController],
})
export class AppModule {}
