import { z } from "zod";

// The Amadeus (or mock) flight offer is a large nested object we persist as-is.
// We only assert the fields the booking logic actually reads, and keep the rest
// via `.passthrough()`.
const flightOfferSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    price: z
      .object({
        total: z.union([z.string(), z.number()]),
        currency: z.string().min(1),
      })
      .passthrough(),
    itineraries: z.array(z.any()).min(1, "At least one itinerary is required"),
  })
  .passthrough();

const passengerSchema = z.object({
  firstName: z.string().trim().min(1, "firstName is required"),
  lastName: z.string().trim().min(1, "lastName is required"),
  dateOfBirth: z.string().trim().min(1, "dateOfBirth is required"),
  travelerType: z.string().trim().min(1, "travelerType is required"),
});

export const createBookingSchema = z.object({
  flightOffer: flightOfferSchema,
  passengers: z
    .array(passengerSchema)
    .min(1, "At least one passenger is required"),
});

export const editBookingSchema = z.object({
  newFlightOffer: flightOfferSchema,
});

// Route param `:id` — coerce the string to a positive integer.
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("Invalid booking ID"),
});
