import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../src/lib/prisma.js", () => import("./mocks/prisma.js"));
vi.mock("../src/services/flightApiService.js", () => ({
  searchFlights: vi.fn(),
}));
vi.mock("firebase-admin", () => ({
  default: {
    apps: [],
    initializeApp: vi.fn(),
    credential: { cert: vi.fn() },
    auth: () => ({ verifyIdToken: vi.fn() }),
  },
}));

import app from "../src/app.js";

describe("app infrastructure", () => {
  it("exposes a health check", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.uptime).toBe("number");
  });

  it("returns a structured 404 for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.status).toBe("error");
    expect(res.body.message).toMatch(/Route not found/);
  });

  it("sets Helmet security headers", async () => {
    const res = await request(app).get("/health");
    // Helmet sets this header by default.
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });
});
