import { Controller, Get, Post, Body, Param, NotFoundException } from "@nestjs/common";
import { TenantsService } from "./tenants.service";

@Controller("tenants")
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Post()
  create(@Body() body: { name: string; plan?: string }) {
    return this.tenantsService.create(body.name, body.plan);
  }

  @Get()
  list() {
    return this.tenantsService.list();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    const tenant = this.tenantsService.findById(id);
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }
    return tenant;
  }
}
