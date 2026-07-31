import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("NestJS B2B API (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/api/health (GET)", () => {
    return request(app.getHttpServer())
      .get("/api/health")
      .expect(200)
      .expect({ status: "healthy", service: "nestjs-b2b-api" });
  });

  it("/api/auth/register (POST)", () => {
    return request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "Pass123!", tenantId: "t1" })
      .expect(201)
      .expect((res: any) => {
        expect(res.body.email).toBe("test@example.com");
        expect(res.body.id).toBeDefined();
      });
  });

  it("/api/auth/login (POST)", async () => {
    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "login@example.com", password: "Pass123!", tenantId: "t1" });

    return request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "Pass123!" })
      .expect(201)
      .expect((res: any) => {
        expect(res.body.access_token).toBeDefined();
      });
  });

  it("/api/tenants (POST + GET)", async () => {
    const createRes = await request(app.getHttpServer())
      .post("/api/tenants")
      .send({ name: "Acme Corp", plan: "pro" })
      .expect(201);

    expect(createRes.body.name).toBe("Acme Corp");
    expect(createRes.body.id).toBeDefined();

    return request(app.getHttpServer())
      .get("/api/tenants")
      .expect(200)
      .expect((res: any) => {
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it("/api/billing/checkout (POST)", () => {
    return request(app.getHttpServer())
      .post("/api/billing/checkout")
      .send({ tenantId: "t1", plan: "pro" })
      .expect(201)
      .expect((res: any) => {
        expect(res.body.url).toContain("checkout.stripe.com");
        expect(res.body.sessionId).toBeDefined();
      });
  });
});
