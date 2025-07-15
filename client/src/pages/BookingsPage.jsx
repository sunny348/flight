import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/apiClient";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  IconPlane,
  IconUser,
  IconTicket,
  IconCalendar,
  IconClock,
  IconArrowRight,
} from "../components/ui/Icons";
import {
  StaggerContainer,
  StaggerItem,
  FadeIn,
  SlideUp,
} from "../components/ui/Animation";

const BookingCard = ({ booking, onCancelBooking }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to format time
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // The bookedFlights array should contain a single entry with the flightOffer
  const flightOffer = booking.bookedFlights?.[0]?.flightOffer;
  const firstItinerary = flightOffer?.itineraries?.[0];
  const firstSegment = firstItinerary?.segments?.[0];
  const lastSegment =
    firstItinerary?.segments?.[firstItinerary?.segments?.length - 1];

  // Calculate time until departure
  const departureDate = firstSegment?.departure?.at
    ? new Date(firstSegment.departure.at)
    : null;
  const now = new Date();
  const daysUntilDeparture = departureDate
    ? Math.floor((departureDate - now) / (1000 * 60 * 60 * 24))
    : null;

  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "CANCELLED":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "MODIFIED":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      default:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
    }
  };

  // Check if booking can be cancelled
  const canBeCancelled = () => {
    return (
      (booking.status === "CONFIRMED" || booking.status === "MODIFIED") &&
      (!booking.bookedFlights?.[0]?.departureAt ||
        new Date(booking.bookedFlights[0].departureAt) > new Date())
    );
  };

  // Check if booking can be edited
  const canBeEdited = () => {
    return (
      (booking.status === "CONFIRMED" || booking.status === "MODIFIED") &&
      (!booking.bookedFlights?.[0]?.departureAt ||
        new Date(booking.bookedFlights[0].departureAt) > new Date())
    );
  };

  return (
    <Card
      withBorder
      withHover
      className="overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <IconTicket className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Booking #{String(booking.id).substring(0, 8)}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <IconCalendar className="w-4 h-4" />
                <span>Booked on: {formatDate(booking.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {flightOffer?.price?.currency || "$"}{" "}
              {parseFloat(booking.totalPrice).toFixed(2)}
            </p>
            <span
              className={`mt-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                booking.status
              )}`}>
              {booking.status}
            </span>
          </div>
        </div>

        {/* Flight Summary */}
        {firstSegment && lastSegment ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatTime(firstSegment.departure?.at)}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {firstSegment.departure?.iataCode}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(firstSegment.departure?.at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex-1 mx-4">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-gray-300 dark:border-gray-600 w-full"></div>
                  <div className="absolute flex flex-col items-center">
                    <IconPlane className="w-5 h-5 text-primary-500 transform rotate-90" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-secondary-900 px-2 mt-1">
                      {firstItinerary?.duration
                        ?.replace("PT", "")
                        .replace("H", "h ")
                        .replace("M", "m") || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatTime(lastSegment.arrival?.at)}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {lastSegment.arrival?.iataCode}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(lastSegment.arrival?.at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {daysUntilDeparture !== null && daysUntilDeparture >= 0 ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center gap-2 text-blue-800 dark:text-blue-300 text-sm">
                <IconClock className="w-5 h-5" />
                <span>
                  {daysUntilDeparture === 0
                    ? "Your flight is today!"
                    : `${daysUntilDeparture} day${
                        daysUntilDeparture !== 1 ? "s" : ""
                      } until your flight`}
                </span>
              </div>
            ) : (
              daysUntilDeparture !== null && (
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-gray-700 dark:text-gray-300 text-sm">
                  This flight has already departed
                </div>
              )
            )}
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-gray-700 dark:text-gray-300">
              Flight details not available
            </p>
          </div>
        )}

        {/* Expandable details */}
        {expanded && (
          <div className="mt-6 space-y-4 animate-fadeIn">
            {/* Passengers */}
            {booking.passengers && booking.passengers.length > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IconUser className="w-4 h-4" />
                  Passengers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {booking.passengers.map((passenger) => (
                    <div
                      key={passenger.id}
                      className="p-2 bg-white dark:bg-gray-800 rounded-md text-sm border border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {passenger.firstName} {passenger.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {passenger.travelerType}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flight segments */}
            {firstItinerary?.segments && firstItinerary.segments.length > 0 && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IconPlane className="w-4 h-4" />
                  Flight Segments
                </h4>
                <div className="space-y-3">
                  {firstItinerary.segments.map((segment, index) => (
                    <div
                      key={segment.id || index}
                      className="p-3 bg-gray-800 rounded-md border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-200">
                          {segment.carrierCode} {segment.number}
                        </span>
                        <span className="text-xs text-gray-400">
                          Aircraft: {segment.aircraft?.code || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-left">
                          <p className="font-medium text-gray-300">
                            {segment.departure?.iataCode}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatTime(segment.departure?.at)}
                          </p>
                        </div>

                        <div className="flex-1 mx-2 px-2">
                          <div className="relative flex items-center justify-center">
                            <div className="border-t border-dashed border-gray-600 w-full"></div>
                            <div className="absolute bg-gray-800 px-1 text-xs text-gray-400">
                              {segment.duration
                                ?.replace("PT", "")
                                .replace("H", "h ")
                                .replace("M", "m") || "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-medium text-gray-300">
                            {segment.arrival?.iataCode}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatTime(segment.arrival?.at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional information */}
            {booking.cancellationFee > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-red-700 dark:text-red-300 text-sm">
                Cancellation Fee Applied: {booking.currency || "$"}{" "}
                {booking.cancellationFee.toFixed(2)}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-between items-center">
          <Button
            variant={expanded ? "ghost" : "secondary"}
            size="sm"
            onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show Less" : "Show Details"}
          </Button>

          <div className="flex flex-wrap gap-2">
            {canBeEdited() && (
              <Button
                variant="primary"
                size="sm"
                icon={<IconArrowRight />}
                iconPosition="right"
                onClick={() =>
                  navigate(`/edit-booking/${booking.id}`, {
                    state: { bookingData: booking },
                  })
                }>
                Edit
              </Button>
            )}

            {canBeCancelled() && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onCancelBooking(booking.id)}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const BookingsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: bookings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await apiClient.get("/bookings");
      return response.data;
    },
    retry: 1,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId) => apiClient.patch(`/bookings/${bookingId}/cancel`),
    onSuccess: (data) => {
      toast.success(data.data.message || "Booking cancelled successfully!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to cancel booking.");
    },
  });

  const handleCancelBooking = (bookingId) => {
    if (
      window.confirm(
        "Are you sure you want to cancel this booking? Cancellation fees may apply."
      )
    ) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Loading your bookings...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg text-center max-w-2xl mx-auto my-10">
        <p className="text-lg font-medium mb-2">Error loading bookings</p>
        <p>
          {error.response?.data?.message ||
            error.message ||
            "An unknown error occurred"}
        </p>
        <Button
          variant="primary"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["bookings"] })
          }
          className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <FadeIn>
        <div className="text-center py-16 max-w-2xl mx-auto">
          <div className="mb-6 mx-auto w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <IconTicket className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No Bookings Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You don't have any bookings yet. Start by searching for flights and
            book your next adventure!
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/flights")}
            icon={<IconPlane />}>
            Search Flights
          </Button>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Bookings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your upcoming trips and view past bookings
        </p>
      </div>

      <StaggerContainer>
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <StaggerItem key={booking.id}>
              <BookingCard
                booking={booking}
                onCancelBooking={handleCancelBooking}
              />
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>

      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
        <Button
          variant="primary"
          onClick={() => navigate("/flights")}>
          Book a New Flight
        </Button>
      </div>
    </div>
  );
};

export default BookingsPage;
