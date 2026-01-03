import { test, expect, request } from "@playwright/test";

test.describe("AuthController", () => {
  // ================= REGISTER =================

  test("AUTH-REG-01 Register new user success", async () => {
    const api = await request.newContext({ baseURL: process.env.BASE_URL });
    console.log("BASE_URL:", process.env.BASE_URL);

    const res = await api.post("/auth/register-user", {
      data: {
        email: `user_${Date.now()}@test.com`,
        password: "123456",
        firstName: "Test",
        lastName: "User",
      },
    });

    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("Registration successful");
  });

  test("AUTH-REG-02 Register user already exists -> 409", async () => {
    const api = await request.newContext({ baseURL: process.env.BASE_URL });

    const res = await api.post("/auth/register-user", {
      data: {
        email: process.env.EXISTING_EMAIL,
        password: "123456",
        firstName: "Test",
        lastName: "User",
      },
    });

    expect(res.status()).toBe(409);
    expect(await res.text()).toContain("already");
  });

  test("AUTH-REG-03 Register missing email -> 400", async () => {
    const api = await request.newContext({ baseURL: process.env.BASE_URL });

    const res = await api.post("/auth/register-user", {
      data: {
        password: "123456",
        firstName: "Test",
        lastName: "User",
      },
    });

    expect(res.status()).toBe(400);
  });

  // ================= LOGIN =================

  test("AUTH-LOGIN-01 Login success", async () => {
    const api = await request.newContext({ baseURL: process.env.BASE_URL });

    const res = await api.post("/auth/login", {
      data: {
        email: process.env.EXISTING_EMAIL,
        password: process.env.EXISTING_PASSWORD,
      },
    });

    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.token).toBeDefined();
    expect(body.email).toBe(process.env.EXISTING_EMAIL);
    expect(Array.isArray(body.roles)).toBeTruthy();
  });

  test("AUTH-LOGIN-02 Login wrong password -> 401", async () => {
    const api = await request.newContext({ baseURL: process.env.BASE_URL });

    const res = await api.post("/auth/login", {
      data: {
        email: process.env.EXISTING_EMAIL,
        password: "wrong-password",
      },
    });

    expect(res.status()).toBe(401);
  });

  test("AUTH-LOGIN-03 Login email not exist -> 401", async () => {
    const api = await request.newContext({ baseURL: process.env.BASE_URL });

    const res = await api.post("/auth/login", {
      data: {
        email: "not_exist@test.com",
        password: "123456",
      },
    });

    expect(res.status()).toBe(401);
  });

  test("AUTH-LOGIN-04 Login missing password -> 400", async () => {
    const api = await request.newContext({ baseURL: process.env.BASE_URL });

    const res = await api.post("/auth/login", {
      data: {
        email: process.env.EXISTING_EMAIL,
      },
    });

    expect(res.status()).toBe(400);
  });
});
