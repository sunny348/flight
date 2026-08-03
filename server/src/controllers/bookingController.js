import prisma from "../lib/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Request bodies are validated by Zod middleware before reaching these handlers,
// and unexpected/Prisma errors bubble up to the central error handler.

export const createBooking = asyncHandler(async (req, res) => {
  const userId = parseInt(req.user.id); // Ensure userId is an integer
  const { flightOffer, passengers } = req.body;

  // --- Extract departureAt from flightOffer ---
  let departureAt = null;
  if (
    flightOffer.itineraries?.[0]?.segments?.[0]?.departure?.at
  ) {
    departureAt = new Date(flightOffer.itineraries[0].segments[0].departure.at);
  } else {
    console.warn(
      "Could not extract departureAt from flightOffer. Booking will proceed without it.",
      flightOffer.id
    );
  }

  const newBooking = await prisma.booking.create({
    data: {
      userId,
      totalPrice: parseFloat(flightOffer.price.total),
      currency: flightOffer.price.currency,
      status: "CONFIRMED",
      cancellationFee: null,
      modificationFee: null,
      paymentStatus: "PENDING",
      bookedFlights: {
        create: [{ flightOffer, departureAt }],
      },
      passengers: {
        createMany: {
          data: passengers.map((p) => ({
            firstName: p.firstName,
            lastName: p.lastName,
            dateOfBirth: p.dateOfBirth, // Assuming YYYY-MM-DD string
            travelerType: p.travelerType, // e.g., ADULT
          })),
        },
      },
    },
    include: {
      bookedFlights: true,
      passengers: true,
      user: { select: { name: true, email: true } },
    },
  });

  res.status(201).json({
    message: "Booking initiated successfully. Proceed to payment.",
    bookingId: newBooking.id,
    totalPrice: newBooking.totalPrice,
    currency: newBooking.currency,
  });
});

export const listUserBookings = asyncHandler(async (req, res) => {
  const userId = parseInt(req.user.id);

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      bookedFlights: true,
      passengers: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(bookings);
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const userId = parseInt(req.user.id);
  const bookingId = parseInt(req.params.id); // validated to a positive int by Zod

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { bookedFlights: true }, // Need this for departureAt
  });

  if (!booking) throw new AppError(404, "Booking not found.");
  if (booking.userId !== userId)
    throw new AppError(403, "You are not authorized to cancel this booking.");
  if (booking.status === "CANCELLED")
    throw new AppError(400, "Booking is already cancelled.");

  if (!booking.bookedFlights?.[0]?.departureAt) {
    throw new AppError(
      400,
      "Cannot determine flight departure time for this booking."
    );
  }

  const departureAt = new Date(booking.bookedFlights[0].departureAt);
  const now = new Date();

  if (departureAt <= now) {
    throw new AppError(
      400,
      "Cannot cancel a booking for a flight that has already departed or is departing now."
    );
  }

  const timeUntilDeparture = departureAt.getTime() - now.getTime();

  let cancellationFee = 0;
  let message = "Booking cancelled successfully.";

  if (timeUntilDeparture < SEVEN_DAYS_MS) {
    // Less than 7 days: Apply a fee (e.g., 20% of total price)
    cancellationFee = booking.totalPrice * 0.2; // Mock 20% fee
    message = `Booking cancelled. A fee of ${booking.currency} ${cancellationFee.toFixed(
      2
    )} applies as cancellation is within 7 days of departure. No refund will be issued (mock).`;
  } else {
    message = "Booking cancelled successfully. Refund will be processed (mock).";
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      cancellationFee,
    },
    include: {
      bookedFlights: true,
      passengers: true,
      user: { select: { name: true, email: true } },
    },
  });

  res.status(200).json({ message, booking: updatedBooking });
});

export const editBooking = asyncHandler(async (req, res) => {
  const userId = parseInt(req.user.id);
  const bookingId = parseInt(req.params.id); // validated to a positive int by Zod
  const { newFlightOffer } = req.body;

  // The flight-offer shape is validated by Zod; still guard the deep departure
  // path since the schema keeps nested itinerary items as `any`.
  if (!newFlightOffer.itineraries?.[0]?.segments?.[0]?.departure?.at) {
    throw new AppError(400, "Valid new flight offer details are required.");
  }

  const originalBooking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { bookedFlights: true },
  });

  if (!originalBooking) throw new AppError(404, "Booking not found.");
  if (originalBooking.userId !== userId)
    throw new AppError(403, "You are not authorized to edit this booking.");
  if (originalBooking.status === "CANCELLED")
    throw new AppError(400, "Cannot edit a cancelled booking.");

  const originalBookedFlight = originalBooking.bookedFlights?.[0];
  if (!originalBookedFlight || !originalBookedFlight.departureAt) {
    throw new AppError(400, "Original flight details are missing or corrupt.");
  }

  const originalDepartureAt = new Date(originalBookedFlight.departureAt);
  const now = new Date();

  if (originalDepartureAt <= now) {
    throw new AppError(
      400,
      "Cannot edit a booking for a flight that has already departed or is departing now."
    );
  }

  // --- Fee Calculation (1-week rule for original departure) ---
  const timeUntilOriginalDeparture = originalDepartureAt.getTime() - now.getTime();
  let modificationFee = 0;
  let feeMessage = "";

  if (timeUntilOriginalDeparture < SEVEN_DAYS_MS) {
    // Less than 7 days from original departure: 10% modification fee
    modificationFee = originalBooking.totalPrice * 0.1; // Mock 10% fee
    feeMessage = ` A modification fee of ${originalBooking.currency} ${modificationFee.toFixed(
      2
    )} applies as the original departure was within 7 days.`;
  }

  const newDepartureAt = new Date(
    newFlightOffer.itineraries[0].segments[0].departure.at
  );

  // --- Mock Payment Difference Calculation (Conceptual) ---
  const newFlightPrice = parseFloat(newFlightOffer.price.total);
  const priceDifference =
    newFlightPrice + modificationFee - originalBooking.totalPrice;
  let paymentMessage = "";

  if (priceDifference > 0) {
    paymentMessage = ` An additional charge of ${originalBooking.currency} ${priceDifference.toFixed(
      2
    )} has been processed (mock).`;
  } else if (priceDifference < 0) {
    paymentMessage = ` A partial refund of ${originalBooking.currency} ${Math.abs(
      priceDifference
    ).toFixed(2)} has been processed (mock).`;
  } else {
    paymentMessage = " The total price remains the same.";
  }

  // Replace the booked flight and update the booking atomically.
  const updatedBooking = await prisma.$transaction(async (tx) => {
    await tx.bookedFlight.deleteMany({ where: { bookingId } });

    return tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "MODIFIED",
        totalPrice: newFlightPrice,
        currency: newFlightOffer.price.currency,
        modificationFee,
        bookedFlights: {
          create: [{ flightOffer: newFlightOffer, departureAt: newDepartureAt }],
        },
        updatedAt: new Date(),
      },
      include: {
        bookedFlights: true,
        passengers: true,
        user: { select: { name: true, email: true } },
      },
    });
  });

  res.status(200).json({
    message: `Booking updated successfully.${feeMessage}${paymentMessage}`,
    booking: updatedBooking,
  });
});
