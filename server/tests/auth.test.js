import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockReset } from "vitest-mock-extended";
import request from "supertest";

// Mock the DB and the flight service (the latter avoids loading Redis/Amadeus).
vi.mock("../src/lib/prisma.js", () => import("./mocks/prisma.js"));
vi.mock("../src/services/flightApiService.js", () => ({
  searchFlights: vi.fn(),
}));
// Avoid initialising the real Firebase Admin SDK on import.
vi.mock("firebase-admin", () => ({
  default: {
    apps: [],
    initializeApp: vi.fn(),
    credential: { cert: vi.fn() },
    auth: () => ({ verifyIdToken: vi.fn() }),
  },
}));

import app from "../src/app.js";
import prisma from "./mocks/prisma.js";

beforeEach(() => {
  mockReset(prisma);
});

describe("POST /api/auth/signup", () => {
  it("creates a user and returns 201 + tokens", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: "new@example.com",
      name: "New User",
    });

    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "new@example.com", password: "password123", name: "New User" });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ id: 1, email: "new@example.com" });
    expect(res.body.accessToken).toBeTruthy();
  });

  it("returns 409 when the email already exists", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: "dup@example.com" });

    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "dup@example.com", password: "password123" });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe("error");
  });

  it("returns 400 for invalid input (bad email, short password)", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "not-an-email", password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});

describe("POST /api/auth/login", () => {
  it("returns 401 for invalid credentials", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "whatever1" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("returns 200 + tokens for a valid password", async () => {
    // bcrypt hash of "password123"
    const bcrypt = (await import("bcryptjs")).default;
    const hash = await bcrypt.hash("password123", 4);
    prisma.user.findUnique.mockResolvedValue({
      id: 7,
      email: "user@example.com",
      name: "User",
      password: hash,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: 7, email: "user@example.com" });
    expect(res.body.accessToken).toBeTruthy();
  });
});
