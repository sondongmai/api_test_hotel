import { test, expect, request } from "@playwright/test";

test.describe("RoomController - USER / PUBLIC", () => {
  test("ROOM-01 Get room types", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL,
    });

    const res = await api.get("/rooms/room/types");
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("ROOM-02 Get all rooms", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL,
    });

    const res = await api.get("/rooms/all-rooms");
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("ROOM-03 Get room by valid id", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL,
    });

    const res = await api.get("/rooms/room/1");

    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("roomType");
  });

  test("ROOM-04 Get room by invalid id -> 404", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL,
    });

    const res = await api.get("/rooms/room/999999");
    expect(res.status()).toBe(404);
  });

  test("ROOM-05 Get available rooms (valid)", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL,
    });

    const res = await api.get("/rooms/available-rooms", {
      params: {
        checkInDate: "2026-01-10",
        checkOutDate: "2026-01-12",
        roomType: "DELUXE",
      },
    });

    expect([200, 204]).toContain(res.status());
  });

  test("ROOM-06 Get available rooms invalid date -> 400", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL,
    });

    const res = await api.get("/rooms/available-rooms", {
      params: {
        checkInDate: "2026-01-12",
        checkOutDate: "2026-01-10",
        roomType: "DELUXE",
      },
    });

    expect([400, 500]).toContain(res.status());
  });
});
