import { Controller, Post, Body, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(
    @Body() body: { email: string; password: string; tenantId: string }
  ) {
    return this.authService.register(body.email, body.password, body.tenantId);
  }

  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    const result = await this.authService.login(body.email, body.password);
    if (!result) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return result;
  }
}
