import { request } from "@playwright/test";

export async function login(email: string, password: string) {
  const api = await request.newContext({
    baseURL: process.env.BASE_URL,
  });

  const res = await api.post("/auth/login", {
    data: { email, password },
  });

  if (res.status() !== 200) {
    throw new Error("Login failed");
  }

  return (await res.json()).token;
}
