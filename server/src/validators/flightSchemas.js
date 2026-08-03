import { z } from "zod";

// Query params arrive as strings; coerce/transform where the controller needs
// non-string values. `adults` becomes a positive integer.
export const flightSearchSchema = z.object({
  origin: z.string().trim().min(1, "origin is required"),
  destination: z.string().trim().min(1, "destination is required"),
  departureDate: z.string().trim().min(1, "departureDate is required"),
  adults: z.coerce.number().int().positive("adults must be a positive integer"),
  departureTime: z.string().trim().optional(),
  returnDate: z.string().trim().optional(),
  cabinClass: z.string().trim().optional(),
});
