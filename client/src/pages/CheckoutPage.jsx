import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiClient from "../lib/apiClient";
import { useAuth } from "../contexts/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// A simplified card to display flight segment details
const FlightSegmentDetailCard = ({ segment }) => {
  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();
  return (
    <div className="p-3 bg-gray-800 rounded-md mb-2">
      <p className="font-semibold text-sm text-gray-200">
        {segment.carrierCode} {segment.number}: {segment.departure.iataCode} →{" "}
        {segment.arrival.iataCode}
      </p>
      <p className="text-xs text-gray-400">
        Departs: {formatDate(segment.departure.at)} | Arrives:{" "}
        {formatDate(segment.arrival.at)}
      </p>
      <p className="text-xs text-gray-400">Duration: {segment.duration}</p>
    </div>
  );
};

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [currentBookingId, setCurrentBookingId] = useState(null); // To store bookingId for payment verification

  // Retrieve flightOffer and adults count from location state
  const {
    selectedOffer: flightOffer,
    searchParams,
    dictionaries,
  } = location.state || {};
  const numAdults = searchParams?.adults || 1;

  const initialFirstName = user?.name?.split(" ")[0] || "";
  const initialLastName = user?.name?.split(" ").slice(1).join(" ") || "";

  // Initialize passengers based on the number of adults
  const [passengers, setPassengers] = useState(() => {
    const initialPassengers = [];
    for (let i = 0; i < numAdults; i++) {
      if (i === 0) {
        // Prefill first passenger with user details if available
        initialPassengers.push({
          id: `passenger-${i + 1}`, // Add a unique ID for React key prop, though index is used for now
          firstName: initialFirstName,
          lastName: initialLastName,
          dateOfBirth: null, // YYYY-MM-DD
          travelerType: "ADULT",
        });
      } else {
        // Subsequent passengers are blank
        initialPassengers.push({
          id: `passenger-${i + 1}`,
          firstName: "",
          lastName: "",
          dateOfBirth: null,
          travelerType: "ADULT",
        });
      }
    }
    return initialPassengers;
  });

  const createBookingMutation = useMutation({
    mutationFn: (bookingData) => apiClient.post("/bookings", bookingData),
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Booking initiation failed. Please try again.";
      toast.error(errorMessage);
      console.error("Booking creation error:", errorMessage, error);
    },
  });

  const createRazorpayOrderMutation = useMutation({
    mutationFn: (orderData) =>
      apiClient.post("/payments/create-order", orderData),
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create Razorpay order. Please try again.";
      toast.error(errorMessage);
      console.error("Razorpay order creation error:", errorMessage, error);
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (verificationData) =>
      apiClient.post("/payments/verify-payment", verificationData),
    onSuccess: (data) => {
      toast.success(
        data.data?.message ||
          "Payment verified successfully! Booking confirmed."
      );
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      navigate("/bookings", {
        state: { bookingSuccess: true, bookingId: data.data?.bookingId },
      });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Payment verification failed. Please contact support.";
      toast.error(errorMessage);
      console.error("Payment verification error:", errorMessage, error);
      // Optionally, navigate to a payment failed page or show options to retry
    },
  });

  const handlePassengerChange = (index, eventOrDate, fieldName) => {
    const newPassengers = [...passengers];
    let value;
    let name;

    if (fieldName === "dateOfBirth") {
      name = fieldName;
      value = eventOrDate;
    } else {
      name = eventOrDate.target.name;
      value = eventOrDate.target.value;
    }

    newPassengers[index] = { ...newPassengers[index], [name]: value };
    setPassengers(newPassengers);
  };

  if (!flightOffer) {
    return (
      <div className="text-center p-10">
        <p className="text-xl text-red-600">No flight offer selected.</p>
        <Link
          to="/flights"
          className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Search for Flights
        </Link>
      </div>
    );
  }

  const handleConfirmBookingAndPay = async () => {
    if (!flightOffer) {
      toast.error("No flight offer selected.");
      return;
    }

    const processedPassengers = passengers.map((p) => {
      let formattedDateOfBirth = p.dateOfBirth;
      if (p.dateOfBirth && p.dateOfBirth instanceof Date) {
        const date = p.dateOfBirth;
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        formattedDateOfBirth = `${year}-${month}-${day}`;
      }
      return {
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: formattedDateOfBirth,
        travelerType: p.travelerType,
      };
    });

    for (const p of processedPassengers) {
      if (!p.firstName || !p.lastName || !p.dateOfBirth || !p.travelerType) {
        toast.warn(
          "Please fill in all required passenger details (First Name, Last Name, Date of Birth, Traveler Type)."
        );
        return;
      }
    }

    try {
      // Step 1: Create booking on the backend (paymentStatus: PENDING)
      const bookingResponse = await createBookingMutation.mutateAsync({
        flightOffer,
        passengers: processedPassengers,
      });

      if (!bookingResponse || !bookingResponse.data?.bookingId) {
        toast.error("Failed to initiate booking. Please try again.");
        return;
      }

      const { bookingId, totalPrice, currency } = bookingResponse.data;
      setCurrentBookingId(bookingId); // Store bookingId for payment verification step

      // Step 2: Create Razorpay order
      const razorpayOrderResponse =
        await createRazorpayOrderMutation.mutateAsync({
          amount: totalPrice,
          currency: currency,
          receipt: `receipt_booking_${bookingId}`, // Unique receipt ID
          notes: { bookingId: bookingId.toString() }, // Pass bookingId in notes
        });

      if (!razorpayOrderResponse || !razorpayOrderResponse.data?.id) {
        toast.error("Failed to create Razorpay order. Please try again.");
        // TODO: Potentially cancel the booking created in step 1 or mark as payment_failed
        return;
      }

      const razorpayOrder = razorpayOrderResponse.data;

      // Step 3: Open Razorpay Checkout
      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        toast.error(
          "Razorpay Key ID is not configured. Payment cannot proceed."
        );
        console.error("VITE_RAZORPAY_KEY_ID is not set in .env file");
        return;
      }

      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount, // Amount is in currency subunits. Hence, multiply by 100.
        currency: razorpayOrder.currency,
        name: "Flight Booker", //your business name
        description: `Payment for Booking ID: ${bookingId}`,
        image: "/vite.svg", //optional path to your logo
        order_id: razorpayOrder.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        handler: function (response) {
          // Step 4: Verify Payment
          verifyPaymentMutation.mutate({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: bookingId, // Use the stored bookingId
          });
        },
        prefill: {
          // We recommend using the prefill parameter to auto-fill customer's contact information,
          // if available. Normally, this data would be collected in earlier steps or from user profile.
          name: user?.name || `${initialFirstName} ${initialLastName}`.trim(),
          email: user?.email,
          // contact: "9999999999" // Optional
        },
        notes: {
          address: "Flight Booker Corporate Office", // Optional
          booking_id: bookingId.toString(),
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            toast.info(
              "Payment was not completed. Your booking is pending payment."
            );
            // You might want to navigate the user or provide options here
            // e.g., navigate('/booking-details/' + bookingId) where they can try paying again.
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error(
          `Payment Failed: ${response.error.description} (Reason: ${response.error.reason}, Code: ${response.error.code})`
        );
        // Log detailed error for debugging
        console.error("Razorpay payment failed details:", response.error);
        // You might want to update the booking status to FAILED on your backend here.
        // For now, we just show an error. The booking remains PENDING.
        // Example: updateBookingStatusMutation.mutate({ bookingId, status: "PAYMENT_FAILED" });
      });
      rzp.open();
    } catch (error) {
      // Error from createBookingMutation or createRazorpayOrderMutation will be caught here if not handled by their own onError
      // This catch block might be redundant if mutations handle their errors and don't rethrow
      // or if mutateAsync doesn't throw on handled errors.
      console.error(
        "Error in booking or Razorpay order creation process:",
        error
      );
      // Generic error toast already shown by individual mutation's onError
    }
  };

  const totalPrice = parseFloat(flightOffer?.price?.total).toFixed(2);
  const currency = flightOffer?.price?.currency;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Confirm Your Booking
      </h1>

      <div className="bg-white shadow-xl rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4 border-b pb-2">
          Flight Summary
        </h2>
        {flightOffer.itineraries.map((itinerary, index) => (
          <div
            key={index}
            className="mb-3">
            <h3 className="text-md font-medium text-gray-600 mb-1">
              Leg {index + 1} (Duration: {itinerary.duration})
            </h3>
            {itinerary.segments.map((segment, segIndex) => (
              <FlightSegmentDetailCard
                key={segIndex}
                segment={segment}
              />
            ))}
          </div>
        ))}
        <div className="mt-4 pt-4 border-t text-right">
          <p className="text-xl font-bold text-green-600">
            Total Price: {currency} ${totalPrice}
          </p>
        </div>
      </div>

      {/* Passenger Details Form */}
      <div className="bg-white shadow-xl rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-3">
          Passenger Details
        </h2>
        {passengers.map((passenger, index) => (
          <div
            key={index}
            className="mb-4 p-4 border rounded-md">
            <h3 className="text-lg font-medium text-gray-600 mb-3">
              Passenger {index + 1}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`firstName-${index}`}
                  className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id={`firstName-${index}`}
                  name="firstName"
                  value={passenger.firstName}
                  onChange={(e) => handlePassengerChange(index, e, "firstName")}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor={`lastName-${index}`}
                  className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id={`lastName-${index}`}
                  name="lastName"
                  value={passenger.lastName}
                  onChange={(e) => handlePassengerChange(index, e, "lastName")}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor={`dateOfBirth-${index}`}
                  className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <DatePicker
                  id={`passenger-${index}-dob`}
                  selected={passenger.dateOfBirth}
                  onChange={(date) =>
                    handlePassengerChange(index, date, "dateOfBirth")
                  }
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="YYYY-MM-DD"
                  maxDate={new Date()}
                  popperPlacement="bottom"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  autoComplete="off"
                />
              </div>
              <div>
                <label
                  htmlFor={`travelerType-${index}`}
                  className="block text-sm font-medium text-gray-700">
                  Traveler Type
                </label>
                <select
                  id={`travelerType-${index}`}
                  name="travelerType"
                  value={passenger.travelerType}
                  onChange={(e) =>
                    handlePassengerChange(index, e, "travelerType")
                  }
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="ADULT">Adult</option>
                  <option value="CHILD">Child</option>
                  <option value="INFANT">Infant</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        {/* TODO: Add button to add more passengers if flightOffer.travelerPricings allows */}
      </div>

      {/* Mock Payment Details - Simplified for MVP */}
      <div className="bg-white shadow-xl rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Payment:</h2>
        <p className="text-sm text-gray-600">Using Razorpay for payment</p>
      </div>

      <button
        onClick={handleConfirmBookingAndPay}
        disabled={
          createBookingMutation.isPending ||
          createRazorpayOrderMutation.isPending ||
          verifyPaymentMutation.isPending
        }
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg transition duration-150 ease-in-out disabled:opacity-50">
        {createBookingMutation.isPending ||
        createRazorpayOrderMutation.isPending
          ? "Processing..."
          : verifyPaymentMutation.isPending
          ? "Verifying Payment..."
          : `Confirm & Pay ${currency} ${totalPrice}`}
      </button>
    </div>
  );
};

export default CheckoutPage;
