import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema } from "../src/validators/authSchemas.js";
import { createBookingSchema } from "../src/validators/bookingSchemas.js";
import { flightSearchSchema } from "../src/validators/flightSchemas.js";

describe("authSchemas", () => {
  it("accepts a valid signup", () => {
    const r = signupSchema.safeParse({
      email: "a@b.com",
      password: "password123",
      name: "A",
    });
    expect(r.success).toBe(true);
  });

  it("rejects a bad email and short password", () => {
    expect(signupSchema.safeParse({ email: "x", password: "123" }).success).toBe(
      false
    );
  });

  it("requires a password on login", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "" }).success
    ).toBe(false);
  });
});

describe("createBookingSchema", () => {
  const offer = {
    id: "1",
    price: { total: "100", currency: "USD" },
    itineraries: [{ segments: [] }],
  };

  it("rejects an empty passenger list", () => {
    const r = createBookingSchema.safeParse({ flightOffer: offer, passengers: [] });
    expect(r.success).toBe(false);
  });

  it("accepts a well-formed booking", () => {
    const r = createBookingSchema.safeParse({
      flightOffer: offer,
      passengers: [
        {
          firstName: "Ada",
          lastName: "Lovelace",
          dateOfBirth: "1990-01-01",
          travelerType: "ADULT",
        },
      ],
    });
    expect(r.success).toBe(true);
  });
});

describe("flightSearchSchema", () => {
  it("coerces adults to a number", () => {
    const r = flightSearchSchema.safeParse({
      origin: "DEL",
      destination: "BOM",
      departureDate: "2999-01-01",
      adults: "3",
    });
    expect(r.success).toBe(true);
    expect(r.data.adults).toBe(3);
  });

  it("rejects a missing origin", () => {
    const r = flightSearchSchema.safeParse({
      destination: "BOM",
      departureDate: "2999-01-01",
      adults: "1",
    });
    expect(r.success).toBe(false);
  });
});
