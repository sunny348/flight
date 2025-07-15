import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/apiClient";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Reusable component for displaying flight segments (can be extracted to a shared file later)
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

const EditBookingPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Original booking data passed from the previous page
  const [originalBooking, setOriginalBooking] = useState(
    location.state?.bookingData || null
  );

  // States for new flight search
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null); // Optional
  const [adults, setAdults] = useState(1); // This should ideally match original booking's passengers count
  const [searchParams, setSearchParams] = useState(null);
  const [selectedNewFlight, setSelectedNewFlight] = useState(null);

  useEffect(() => {
    if (originalBooking) {
      // Pre-fill search based on original booking, if appropriate
      // For simplicity, we'll require manual search for now.
      // We also need to ensure the 'adults' count matches the number of passengers in originalBooking
      if (originalBooking.passengers && originalBooking.passengers.length > 0) {
        setAdults(
          originalBooking.passengers.filter((p) => p.travelerType === "ADULT")
            .length || 1
        );
        // Further logic could be added for children/infants if search supports it
      }
    } else {
      // If originalBooking is not in state (e.g. direct navigation/refresh), fetch it.
      // This part is crucial for robustness but complex. For MVP v1, we rely on state.
      // Consider adding a fetchBookingById query here.
      toast.warn(
        "Original booking data not found. Please go back to My Bookings and try again."
      );
      // navigate('/bookings'); // Or redirect
    }
  }, [originalBooking, navigate]);

  // Query for flight search (similar to FlightSearchPage)
  const {
    data: newFlightOffers,
    isLoading: isLoadingFlights,
    isError: isErrorFlights,
    error: errorFlights,
  } = useQuery({
    queryKey: ["flights", searchParams],
    queryFn: async () => {
      if (!searchParams) return null;
      const response = await apiClient.get("/flights/search", {
        params: searchParams,
      });
      return response.data;
    },
    enabled: !!searchParams,
    retry: 1,
  });

  const handleFlightSearchSubmit = (e) => {
    e.preventDefault();
    if (!origin || !destination || !departureDate || !adults) {
      toast.warn(
        "Please fill in Origin, Destination, Departure Date, and Adults for the new search."
      );
      return;
    }
    const formatDateForAPI = (date) =>
      date ? date.toISOString().split("T")[0] : undefined;
    setSearchParams({
      origin,
      destination,
      departureDate: formatDateForAPI(departureDate),
      returnDate: formatDateForAPI(returnDate),
      adults,
      // cabinClass: 'ECONOMY', // Add if needed
    });
    setSelectedNewFlight(null); // Reset previous selection
  };

  // Mutation for submitting the booking edit
  const editBookingMutation = useMutation({
    mutationFn: (payload) => apiClient.put(`/bookings/${bookingId}`, payload),
    onSuccess: (data) => {
      toast.success(data.data.message || "Booking updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      navigate("/bookings");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update booking.");
    },
  });

  const handleConfirmEdit = () => {
    if (!selectedNewFlight) {
      toast.error("Please select a new flight first.");
      return;
    }
    // The backend will calculate actual fees and final price
    editBookingMutation.mutate({ newFlightOffer: selectedNewFlight });
  };

  if (!originalBooking) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">
          Loading booking details or booking not found. Try returning to{" "}
          <Link
            to="/bookings"
            className="underline">
            My Bookings
          </Link>
          .
        </p>
      </div>
    );
  }

  const originalFlightOffer = originalBooking.bookedFlights?.[0]?.flightOffer;

  // Calculate modification fee and price difference (display only, backend does final calc)
  let displayModificationFee = 0;
  const originalDepartureDate = new Date(
    originalBooking.bookedFlights?.[0]?.departureAt
  );
  if (
    originalDepartureDate.getTime() - new Date().getTime() <
    7 * 24 * 60 * 60 * 1000
  ) {
    displayModificationFee = parseFloat(originalBooking.totalPrice) * 0.1; // 10% example
  }
  let displayPriceDifference = 0;
  if (selectedNewFlight) {
    displayPriceDifference =
      parseFloat(selectedNewFlight.price.total) +
      displayModificationFee -
      parseFloat(originalBooking.totalPrice);
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Edit Booking: {bookingId}
      </h1>

      {/* Current Booking Summary */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-blue-700 mb-3">
          Current Flight
        </h2>
        {originalFlightOffer?.itineraries?.map((itinerary, index) => (
          <div
            key={index}
            className="mb-2">
            <h3 className="text-md font-medium text-gray-600">
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
        <p className="text-lg font-semibold mt-2">
          Original Price: {originalBooking.currency}{" "}
          {parseFloat(originalBooking.totalPrice).toFixed(2)}
        </p>
      </div>

      {/* New Flight Search Form */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">
          Search for a New Flight
        </h2>
        <form
          onSubmit={handleFlightSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label
              htmlFor="origin"
              className="block text-sm font-medium text-gray-700">
              Origin
            </label>
            <input
              type="text"
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              required
              className="mt-1 block w-full input input-bordered"
            />
          </div>
          <div>
            <label
              htmlFor="destination"
              className="block text-sm font-medium text-gray-700">
              Destination
            </label>
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              required
              className="mt-1 block w-full input input-bordered"
            />
          </div>
          <div>
            <label
              htmlFor="departureDate"
              className="block text-sm font-medium text-gray-700">
              New Departure Date
            </label>
            <DatePicker
              id="departureDate"
              selected={departureDate}
              onChange={setDepartureDate}
              required
              className="mt-1 block w-full input input-bordered"
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              placeholderText="YYYY-MM-DD"
            />
          </div>
          <div>
            <label
              htmlFor="returnDate"
              className="block text-sm font-medium text-gray-700">
              New Return Date <span className="text-xs">(Optional)</span>
            </label>
            <DatePicker
              id="returnDate"
              selected={returnDate}
              onChange={setReturnDate}
              className="mt-1 block w-full input input-bordered"
              dateFormat="yyyy-MM-DD"
              minDate={departureDate || new Date()}
              disabled={!departureDate}
              placeholderText="YYYY-MM-DD"
              isClearable
            />
          </div>
          <div>
            <label
              htmlFor="adults"
              className="block text-sm font-medium text-gray-700">
              Adults
            </label>
            <input
              type="number"
              id="adults"
              value={adults}
              min="1"
              onChange={(e) =>
                setAdults(Math.max(1, parseInt(e.target.value, 10)))
              }
              required
              className="mt-1 block w-full input input-bordered"
            />
          </div>
          <button
            type="submit"
            disabled={isLoadingFlights}
            className="btn btn-primary md:col-span-2">
            {isLoadingFlights ? "Searching..." : "Search New Flights"}
          </button>
        </form>
      </div>

      {/* New Flight Search Results */}
      {isLoadingFlights && <p>Loading new flight results...</p>}
      {isErrorFlights && (
        <p className="text-red-500">
          Error searching flights:{" "}
          {errorFlights?.response?.data?.message || errorFlights.message}
        </p>
      )}
      {newFlightOffers && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Select New Flight Option
          </h2>
          {newFlightOffers.length === 0 && (
            <p>No new flights found for your criteria.</p>
          )}
          {newFlightOffers.map((offer) => (
            <div
              key={offer.id}
              className={`border border-gray-700 p-3 my-2 rounded-md cursor-pointer hover:shadow-md hover:bg-gray-700 ${
                selectedNewFlight?.id === offer.id
                  ? "ring-2 ring-blue-500 bg-blue-600"
                  : "bg-gray-800"
              }`}
              onClick={() => setSelectedNewFlight(offer)}>
              <p className="font-semibold text-gray-200">
                {offer.itineraries[0].segments[0].carrierCode}{" "}
                {offer.itineraries[0].segments[0].number}:{" "}
                {offer.itineraries[0].segments[0].departure.iataCode} to{" "}
                {
                  offer.itineraries[0].segments[
                    offer.itineraries[0].segments.length - 1
                  ].arrival.iataCode
                }
              </p>
              <p className="text-gray-300">
                Price: {offer.price.currency}{" "}
                {parseFloat(offer.price.total).toFixed(2)}
              </p>
              <p className="text-sm text-gray-400">
                Duration: {offer.itineraries[0].duration}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Section */}
      {selectedNewFlight && (
        <div className="bg-white shadow-xl rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-green-700 mb-3">
            Confirm Change
          </h2>
          <div>
            <h3 className="text-lg font-medium">New Selected Flight:</h3>
            <p>
              {selectedNewFlight.itineraries[0].segments[0].departure.iataCode}{" "}
              to{" "}
              {
                selectedNewFlight.itineraries[0].segments[
                  selectedNewFlight.itineraries[0].segments.length - 1
                ].arrival.iataCode
              }{" "}
              - Price: {selectedNewFlight.price.currency}{" "}
              {parseFloat(selectedNewFlight.price.total).toFixed(2)}
            </p>
          </div>
          <div className="mt-3">
            <p>
              Original Booking Price: {originalBooking.currency}{" "}
              {parseFloat(originalBooking.totalPrice).toFixed(2)}
            </p>
            <p
              className={`${
                displayModificationFee > 0 ? "text-orange-600" : ""
              }`}>
              Estimated Modification Fee: {originalBooking.currency}{" "}
              {displayModificationFee.toFixed(2)}
            </p>
            <p
              className={`font-semibold ${
                displayPriceDifference > 0
                  ? "text-red-600"
                  : displayPriceDifference < 0
                  ? "text-green-600"
                  : ""
              }`}>
              Estimated Price Difference (incl. fee): {originalBooking.currency}{" "}
              {displayPriceDifference.toFixed(2)}
              {displayPriceDifference > 0
                ? " (Additional Charge)"
                : displayPriceDifference < 0
                ? " (Partial Refund)"
                : ""}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Note: Final fees and price will be confirmed by the backend.
            </p>
          </div>
          <button
            onClick={handleConfirmEdit}
            disabled={editBookingMutation.isPending}
            className="btn btn-success w-full mt-4">
            {editBookingMutation.isPending
              ? "Processing Update..."
              : "Confirm and Update Booking"}
          </button>
        </div>
      )}
    </div>
  );
};

export default EditBookingPage;
