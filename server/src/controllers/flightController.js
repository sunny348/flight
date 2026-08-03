import * as flightApiService from "../services/flightApiService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const searchAvailableFlights = asyncHandler(async (req, res) => {
  // Query params were validated + coerced by the flightSearchSchema middleware.
  const {
    origin,
    destination,
    departureDate,
    departureTime,
    returnDate,
    adults,
    cabinClass,
  } = req.validatedQuery;

  const searchParams = {
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    departureDate,
    ...(departureTime && { departureTime }),
    ...(returnDate && { returnDate }),
    adults, // already a positive integer
    ...(cabinClass && { cabinClass: cabinClass.toUpperCase() }),
  };

  const flights = await flightApiService.searchFlights(searchParams);

  // searchFlights returns either an array of offers or an Amadeus-shaped object
  // ({ meta, data, dictionaries }). Normalize only the "no results" cases to [];
  // otherwise pass the payload through unchanged.
  res.status(200).json(!flights || flights.length === 0 ? [] : flights);
});
