import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockReset } from "vitest-mock-extended";
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
import prisma from "./mocks/prisma.js";
import { generateToken } from "../src/utils/jwtHelpers.js";

const USER_ID = 1;
const authHeader = () =>
  `Bearer ${generateToken({ id: USER_ID, email: "user@example.com" })}`;

// A minimal valid flight offer for the createBooking schema.
const validFlightOffer = {
  id: "offer-1",
  price: { total: "199.99", currency: "USD" },
  itineraries: [
    { segments: [{ departure: { at: "2999-01-01T09:00:00" } }] },
  ],
};

const validPassenger = {
  firstName: "Ada",
  lastName: "Lovelace",
  dateOfBirth: "1990-01-01",
  travelerType: "ADULT",
};

beforeEach(() => {
  mockReset(prisma);
});

describe("auth guard", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/bookings");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/bookings", () => {
  it("returns 400 when the body fails validation", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", authHeader())
      .send({ flightOffer: validFlightOffer, passengers: [] });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("creates a booking and returns 201", async () => {
    prisma.booking.create.mockResolvedValue({
      id: 42,
      totalPrice: 199.99,
      currency: "USD",
    });

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", authHeader())
      .send({ flightOffer: validFlightOffer, passengers: [validPassenger] });

    expect(res.status).toBe(201);
    expect(res.body.bookingId).toBe(42);
    expect(prisma.booking.create).toHaveBeenCalledOnce();
  });
});

describe("GET /api/bookings", () => {
  it("returns the user's bookings", async () => {
    prisma.booking.findMany.mockResolvedValue([
      { id: 1, userId: USER_ID, status: "CONFIRMED" },
    ]);

    const res = await request(app)
      .get("/api/bookings")
      .set("Authorization", authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: USER_ID } })
    );
  });
});

describe("PATCH /api/bookings/:id/cancel", () => {
  it("cancels a future booking owned by the user", async () => {
    prisma.booking.findUnique.mockResolvedValue({
      id: 5,
      userId: USER_ID,
      status: "CONFIRMED",
      totalPrice: 100,
      currency: "USD",
      bookedFlights: [{ departureAt: new Date("2999-01-01T09:00:00Z") }],
    });
    prisma.booking.update.mockResolvedValue({ id: 5, status: "CANCELLED" });

    const res = await request(app)
      .patch("/api/bookings/5/cancel")
      .set("Authorization", authHeader());

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe("CANCELLED");
  });

  it("returns 403 when cancelling someone else's booking", async () => {
    prisma.booking.findUnique.mockResolvedValue({
      id: 6,
      userId: 999,
      status: "CONFIRMED",
      bookedFlights: [{ departureAt: new Date("2999-01-01T09:00:00Z") }],
    });

    const res = await request(app)
      .patch("/api/bookings/6/cancel")
      .set("Authorization", authHeader());

    expect(res.status).toBe(403);
  });
});
