import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";

// Mock the flight service so no real Amadeus/Redis calls happen.
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
import { searchFlights } from "../src/services/flightApiService.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/flights/search", () => {
  it("returns 400 when required params are missing", async () => {
    const res = await request(app).get("/api/flights/search");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(searchFlights).not.toHaveBeenCalled();
  });

  it("returns flight results for a valid query", async () => {
    searchFlights.mockResolvedValue([{ id: "flight-1" }, { id: "flight-2" }]);

    const res = await request(app).get("/api/flights/search").query({
      origin: "del",
      destination: "bom",
      departureDate: "2999-01-01",
      adults: "1",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    // origin/destination are upper-cased and adults coerced to a number.
    expect(searchFlights).toHaveBeenCalledWith(
      expect.objectContaining({ origin: "DEL", destination: "BOM", adults: 1 })
    );
  });

  it("passes through an Amadeus-shaped object result unchanged", async () => {
    const amadeusPayload = {
      meta: { count: 1 },
      data: [{ id: "1", price: { total: "100" } }],
      dictionaries: {},
    };
    searchFlights.mockResolvedValue(amadeusPayload);

    const res = await request(app).get("/api/flights/search").query({
      origin: "DEL",
      destination: "BOM",
      departureDate: "2999-01-01",
      adults: "1",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(amadeusPayload);
  });

  it("returns an empty array when the service yields nothing", async () => {
    searchFlights.mockResolvedValue([]);

    const res = await request(app).get("/api/flights/search").query({
      origin: "DEL",
      destination: "BOM",
      departureDate: "2999-01-01",
      adults: "2",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
