import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

interface Tenant {
  id: string;
  name: string;
  plan: string;
  createdAt: string;
}

@Injectable()
export class TenantsService {
  private tenants: Map<string, Tenant> = new Map();

  create(name: string, plan: string = "free") {
    const tenant: Tenant = {
      id: crypto.randomUUID(),
      name,
      plan,
      createdAt: new Date().toISOString(),
    };
    this.tenants.set(tenant.id, tenant);
    return tenant;
  }

  findById(id: string): Tenant | undefined {
    return this.tenants.get(id);
  }

  list(): Tenant[] {
    return Array.from(this.tenants.values());
  }
}
