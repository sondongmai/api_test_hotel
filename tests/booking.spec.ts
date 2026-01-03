import { test, expect, request } from "@playwright/test";
import { login } from "./helpers/auth";

let adminToken: string;
let userToken: string;
let confirmationCode: string;

test.beforeAll(async () => {
  userToken = await login(
    process.env.EXISTING_EMAIL!,
    process.env.EXISTING_PASSWORD!
  );
  //   adminToken = await login(
  //     process.env.ADMIN_EMAIL!,
  //     process.env.ADMIN_PASSWORD!
  //   );
  //   console.log("Admin Tokensssssssssssssssssssssssssssssss:", adminToken);
});

test.describe("BookingController", () => {
  // ================= BUSINESS =================

  test("BOOK-01 Guest book room success", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL,
    });

    const res = await api.post("/bookings/room/1/booking", {
      data: {
        guestFullName: "John Doe",
        guestEmail: "john@test.com",
        checkInDate: "2026-01-10",
        checkOutDate: "2026-01-12",
        numOfAdults: 2,
        numOfChildren: 1,
      },
    });

    expect(res.status()).toBe(200);

    const text = await res.text();
    expect(text).toContain("Room booked successfully");

    // lấy confirmation code
    confirmationCode = text.split(":").pop()?.trim()!;
  });

  test("BOOK-02 Book room invalid date -> 400", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL,
    });

    const res = await api.post("/bookings/room/1/booking", {
      data: {
        guestFullName: "John Doe",
        guestEmail: "john@test.com",
        checkInDate: "2026-01-12",
        checkOutDate: "2026-01-10",
        numOfAdults: 2,
      },
    });

    expect(res.status()).toBe(400);
  });

  test("BOOK-03 Get booking by confirmation code", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL,
    });

    const res = await api.get(`/bookings/confirmation/${confirmationCode}`);

    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.bookingConfirmationCode).toBe(confirmationCode);
  });

  test("BOOK-04 Get bookings by user email", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL,
    });

    const res = await api.get(`/bookings/user/john@test.com/bookings`);

    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  // ================= SECURITY =================

  test("BOOK-SEC-01 ADMIN get all bookings", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const res = await api.get("/bookings/all-bookings");
    expect(res.status()).toBe(200);
  });

  test("BOOK-SEC-02 USER cannot get all bookings", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const res = await api.get("/bookings/all-bookings");
    expect(res.status()).toBe(403);
  });

  test("BOOK-SEC-03 ADMIN cancel booking", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    // bookingId giả sử = 1 (tuỳ DB)
    const res = await api.delete("/bookings/booking/1/delete");

    expect([200, 204, 404]).toContain(res.status());
  });
});
