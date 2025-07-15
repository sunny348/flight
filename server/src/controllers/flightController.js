import * as flightApiService from "../services/flightApiService.js";

export const searchAvailableFlights = async (req, res) => {
  const {
    origin,
    destination,
    departureDate,
    departureTime,
    returnDate,
    adults,
    cabinClass,
  } = req.query;

  if (!origin || !destination || !departureDate || !adults) {
    return res.status(400).json({
      message:
        "Missing required search parameters: origin, destination, departureDate, and adults are required.",
    });
  }

  try {
    const searchParams = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      ...(departureTime && { departureTime }),
      ...(returnDate && { returnDate }),
      adults: parseInt(adults, 10),
      ...(cabinClass && { cabinClass: cabinClass.toUpperCase() }),
    };

    const flights = await flightApiService.searchFlights(searchParams);

    if (!flights || flights.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(flights);
  } catch (error) {
    console.error("Error in searchAvailableFlights controller:", error);
    const errorMessage = error.message || "Error searching for flights.";
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: errorMessage });
  }
};
