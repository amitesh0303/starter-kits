import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as crypto from "crypto";

interface User {
  id: string;
  email: string;
  passwordHash: string;
  tenantId: string;
}

@Injectable()
export class AuthService {
  private users: Map<string, User> = new Map();

  constructor(private jwtService: JwtService) {}

  async register(email: string, password: string, tenantId: string) {
    const id = crypto.randomUUID();
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    const user: User = { id, email, passwordHash, tenantId };
    this.users.set(id, user);
    return { id, email, tenantId };
  }

  async login(email: string, password: string) {
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    const user = Array.from(this.users.values()).find(
      (u) => u.email === email && u.passwordHash === passwordHash
    );
    if (!user) {
      return null;
    }
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
    });
    return { access_token: token };
  }

  reset() {
    this.users.clear();
  }
}
