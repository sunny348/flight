import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Placeholder for a mock payment processing function
const processMockPayment = async (paymentDetails) => {
  console.log("Processing mock payment with details:", paymentDetails);
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Simulate a successful payment
  return { success: true, transactionId: `mock_txn_${Date.now()}` };
};

export const createBooking = async (req, res) => {
  const userId = parseInt(req.user.id); // Ensure userId is an integer
  const { flightOffer, passengers } = req.body; // Removed paymentDetails from here

  if (
    !flightOffer ||
    !flightOffer.id ||
    !flightOffer.price ||
    !flightOffer.price.total || // Ensure total price is present
    !flightOffer.price.currency || // Ensure currency is present
    !flightOffer.itineraries
  ) {
    return res
      .status(400)
      .json({ message: "Valid flight offer details are required." });
  }

  if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
    return res.status(400).json({ message: "Passenger details are required." });
  }

  // Basic validation for each passenger
  for (const p of passengers) {
    if (!p.firstName || !p.lastName || !p.dateOfBirth || !p.travelerType) {
      return res.status(400).json({
        message:
          "Each passenger must have firstName, lastName, dateOfBirth, and travelerType.",
      });
    }
  }

  try {
    // --- Mock Payment Processing REMOVED ---

    // --- Extract departureAt from flightOffer ---
    let departureAt = null;
    if (
      flightOffer.itineraries &&
      flightOffer.itineraries.length > 0 &&
      flightOffer.itineraries[0].segments &&
      flightOffer.itineraries[0].segments.length > 0 &&
      flightOffer.itineraries[0].segments[0].departure &&
      flightOffer.itineraries[0].segments[0].departure.at
    ) {
      departureAt = new Date(
        flightOffer.itineraries[0].segments[0].departure.at
      );
    } else {
      // Fallback or error if essential departure info is missing
      // For robust error handling, you might want to return an error here
      console.warn(
        "Could not extract departureAt from flightOffer. Booking will proceed without it.",
        flightOffer.id
      );
      // Depending on business rules, you might want to prevent booking or use a placeholder
    }

    // --- 3. Create Booking, BookedFlight, and Passengers in a transaction ---
    const newBooking = await prisma.booking.create({
      data: {
        userId: userId,
        totalPrice: parseFloat(flightOffer.price.total),
        currency: flightOffer.price.currency,
        status: "CONFIRMED", // Or "AWAITING_PAYMENT" if you prefer and have that enum value
        cancellationFee: null, // Initialize as null
        modificationFee: null, // Initialize as null
        paymentStatus: "PENDING", // Default from schema

        bookedFlights: {
          create: [
            {
              flightOffer: flightOffer,
              departureAt: departureAt, // Save the extracted departure time
            },
          ],
        },
        // Create Passenger records
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
        // Include related data in the response
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
      // Optionally, you can return the full newBooking object if needed by the frontend
      // booking: newBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    // TODO: Implement rollback logic if payment was processed but DB write failed
    // For now, a generic error. Consider if payment was made, this needs careful handling.
    if (error.code === "P2002") {
      // Example: Unique constraint failed
      return res.status(409).json({
        message: "Booking conflict. Please check details.",
        details: error.meta?.target,
      });
    }
    res.status(500).json({ message: "Server error while creating booking." });
  }
};

export const listUserBookings = async (req, res) => {
  const userId = parseInt(req.user.id); // Ensure userId is an integer

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: userId,
      },
      include: {
        bookedFlights: true,
        passengers: true, // Include passenger details
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!bookings || bookings.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Server error while fetching bookings." });
  }
};

export const cancelBooking = async (req, res) => {
  const userId = parseInt(req.user.id);
  const bookingId = parseInt(req.params.id);

  if (isNaN(bookingId)) {
    return res.status(400).json({ message: "Invalid booking ID." });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookedFlights: true, // Need this for departureAt
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to cancel this booking." });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ message: "Booking is already cancelled." });
    }

    // Ensure there's a booked flight and departureAt is set
    if (
      !booking.bookedFlights ||
      booking.bookedFlights.length === 0 ||
      !booking.bookedFlights[0].departureAt
    ) {
      return res.status(400).json({
        message: "Cannot determine flight departure time for this booking.",
      });
    }

    const departureAt = new Date(booking.bookedFlights[0].departureAt);
    const now = new Date();

    if (departureAt <= now) {
      return res.status(400).json({
        message:
          "Cannot cancel a booking for a flight that has already departed or is departing now.",
      });
    }

    const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000;
    const timeUntilDeparture = departureAt.getTime() - now.getTime();

    let cancellationFee = 0;
    let message = "Booking cancelled successfully.";

    if (timeUntilDeparture < sevenDaysInMilliseconds) {
      // Less than 7 days: Apply a fee (e.g., 20% of total price)
      cancellationFee = booking.totalPrice * 0.2; // Mock 20% fee
      message = `Booking cancelled. A fee of ${
        booking.currency
      } ${cancellationFee.toFixed(
        2
      )} applies as cancellation is within 7 days of departure. No refund will be issued (mock).`;
    } else {
      // 7 days or more: No fee (or a nominal one for MVP)
      message =
        "Booking cancelled successfully. Refund will be processed (mock).";
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        cancellationFee: cancellationFee,
        // Potentially update paymentStatus or add a note about refund/fee
      },
      include: {
        bookedFlights: true,
        passengers: true,
        user: { select: { name: true, email: true } },
      },
    });

    res.status(200).json({
      message,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error while cancelling booking." });
  }
};

export const editBooking = async (req, res) => {
  const userId = parseInt(req.user.id);
  const bookingId = parseInt(req.params.id);
  const { newFlightOffer } = req.body; // Expecting the new flight offer selected by the user

  if (isNaN(bookingId)) {
    return res.status(400).json({ message: "Invalid booking ID." });
  }

  // Validate newFlightOffer (basic validation)
  if (
    !newFlightOffer ||
    !newFlightOffer.id || // Assuming newFlightOffer has an ID like structure
    !newFlightOffer.price ||
    !newFlightOffer.price.total ||
    !newFlightOffer.price.currency ||
    !newFlightOffer.itineraries ||
    !newFlightOffer.itineraries[0]?.segments?.[0]?.departure?.at
  ) {
    return res
      .status(400)
      .json({ message: "Valid new flight offer details are required." });
  }

  try {
    const originalBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookedFlights: true, // To get original departureAt and to replace the flight
      },
    });

    if (!originalBooking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (originalBooking.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this booking." });
    }

    if (originalBooking.status === "CANCELLED") {
      return res
        .status(400)
        .json({ message: "Cannot edit a cancelled booking." });
    }

    const originalBookedFlight = originalBooking.bookedFlights?.[0];
    if (!originalBookedFlight || !originalBookedFlight.departureAt) {
      return res
        .status(400)
        .json({ message: "Original flight details are missing or corrupt." });
    }

    const originalDepartureAt = new Date(originalBookedFlight.departureAt);
    const now = new Date();

    if (originalDepartureAt <= now) {
      return res.status(400).json({
        message:
          "Cannot edit a booking for a flight that has already departed or is departing now.",
      });
    }

    // --- Fee Calculation (1-week rule for original departure) ---
    const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000;
    const timeUntilOriginalDeparture =
      originalDepartureAt.getTime() - now.getTime();
    let modificationFee = 0;
    let feeMessage = "";

    if (timeUntilOriginalDeparture < sevenDaysInMilliseconds) {
      // Less than 7 days from original departure: Apply a modification fee (e.g., 10% of original total price)
      modificationFee = originalBooking.totalPrice * 0.1; // Mock 10% fee
      feeMessage = ` A modification fee of ${
        originalBooking.currency
      } ${modificationFee.toFixed(
        2
      )} applies as the original departure was within 7 days.`;
    }

    // --- Extract new departureAt from newFlightOffer ---
    const newDepartureAt = new Date(
      newFlightOffer.itineraries[0].segments[0].departure.at
    );

    // --- Mock Payment Difference Calculation (Conceptual) ---
    const newFlightPrice = parseFloat(newFlightOffer.price.total);
    const priceDifference =
      newFlightPrice + modificationFee - originalBooking.totalPrice;
    let paymentMessage = "";

    if (priceDifference > 0) {
      paymentMessage = ` An additional charge of ${
        originalBooking.currency
      } ${priceDifference.toFixed(2)} has been processed (mock).`;
    } else if (priceDifference < 0) {
      paymentMessage = ` A partial refund of ${
        originalBooking.currency
      } ${Math.abs(priceDifference).toFixed(2)} has been processed (mock).`;
    } else {
      paymentMessage = " The total price remains the same.";
    }

    // --- Database Operations in a Transaction ---
    // 1. Delete old BookedFlight(s) - For MVP, assuming one bookedFlight per booking
    // 2. Create new BookedFlight with newFlightOffer and newDepartureAt
    // 3. Update Booking with new status, totalPrice, modificationFee, etc.
    const updatedBooking = await prisma.$transaction(async (tx) => {
      await tx.bookedFlight.deleteMany({
        where: { bookingId: bookingId },
      });

      const updatedBookingDetails = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "MODIFIED",
          totalPrice: newFlightPrice, // The price of the new flight itself
          currency: newFlightOffer.price.currency,
          modificationFee: modificationFee,
          // Create the new booked flight associated with this booking
          bookedFlights: {
            create: [
              {
                flightOffer: newFlightOffer,
                departureAt: newDepartureAt,
              },
            ],
          },
          updatedAt: new Date(),
        },
        include: {
          bookedFlights: true,
          passengers: true,
          user: { select: { name: true, email: true } },
        },
      });
      return updatedBookingDetails;
    });

    res.status(200).json({
      message: `Booking updated successfully.${feeMessage}${paymentMessage}`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error editing booking:", error);
    if (
      error instanceof prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        message:
          "Failed to update booking. Original booking or related records not found during transaction.",
      });
    }
    res.status(500).json({ message: "Server error while editing booking." });
  }
};

// Add other booking-related controllers here later, e.g.:
// export const getBookingDetails = async (req, res) => { ... };
