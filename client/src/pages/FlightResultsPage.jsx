import React, { useState, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import flightService from "../services/flightService"; // Assuming you have a flightService
import FlightOfferCard from "../components/ui/FlightOfferCard"; // Import the enhanced card
import Container from "../components/layout/Container";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Alert from "../components/ui/Alert";

const FlightResultsPage = () => {
  const location = useLocation();
  const searchParams = location.state?.searchParams;
  const navigate = useNavigate();

  // Sorting state
  const [sortCriteria, setSortCriteria] = useState("price"); // 'price', 'duration', 'segments'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc', 'desc'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Display 10 flight offers per page

  const {
    data: flightData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["flights", searchParams],
    queryFn: () => flightService.searchFlights(searchParams),
    enabled: !!searchParams, // Only run query if searchParams exist
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const flightOffers = flightData?.data;
  const dictionaries = flightData?.dictionaries;

  // Memoized sorting and pagination logic
  const processedOffers = useMemo(() => {
    if (!flightOffers) return [];

    let sortedOffers = [...flightOffers];

    // Sorting logic
    sortedOffers.sort((a, b) => {
      if (sortCriteria === "price") {
        const priceA = parseFloat(a.price.grandTotal);
        const priceB = parseFloat(b.price.grandTotal);
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      } else if (sortCriteria === "duration") {
        // Duration is in ISO 8601 format e.g., PT2H30M. We need to parse this.
        // For simplicity, we'll compare raw strings first, but a proper parsing function would be better.
        // This helper function converts ISO 8601 duration to minutes
        const durationToMinutes = (duration) => {
          if (!duration) return 0;
          const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
          const hours = matches && matches[1] ? parseInt(matches[1]) : 0;
          const minutes = matches && matches[2] ? parseInt(matches[2]) : 0;
          return hours * 60 + minutes;
        };
        // Assuming the shortest duration is on the first itinerary's first segment for simplicity
        // A more robust solution would sum durations of all segments or consider the whole itinerary
        const durationA = durationToMinutes(a.itineraries[0].duration);
        const durationB = durationToMinutes(b.itineraries[0].duration);
        return sortOrder === "asc"
          ? durationA - durationB
          : durationB - durationA;
      } else if (sortCriteria === "segments") {
        const segmentsA = a.itineraries[0].segments.length;
        const segmentsB = b.itineraries[0].segments.length;
        return sortOrder === "asc"
          ? segmentsA - segmentsB
          : segmentsB - segmentsA;
      }
      return 0;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedOffers.slice(indexOfFirstItem, indexOfLastItem);
  }, [flightOffers, sortCriteria, sortOrder, currentPage, itemsPerPage]);

  const totalPages = flightOffers
    ? Math.ceil(flightOffers.length / itemsPerPage)
    : 0;

  const handleSortChange = (criteria) => {
    if (criteria === sortCriteria) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortCriteria(criteria);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handleSelectOffer = (offer) => {
    console.log("Selected flight offer:", offer);
    // Navigate to a booking page (you'll need to create this route and page)
    navigate("/book-flight", {
      state: { selectedOffer: offer, searchParams, dictionaries },
    });
  };

  if (!searchParams) {
    return (
      <Container>
        <Alert type="warning">
          No search parameters provided. Please{" "}
          <Link
            to="/"
            className="font-medium underline">
            start a new search
          </Link>
          .
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="flex flex-col items-center justify-center py-10">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Searching for flights...
        </p>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <Alert type="error">
          Error fetching flight results:{" "}
          {error?.response?.data?.message || error.message}
        </Alert>
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-blue-500 hover:underline">
            Try a new search
          </Link>
        </div>
      </Container>
    );
  }

  if (!flightOffers || flightOffers.length === 0) {
    return (
      <Container>
        <Alert type="info">No flights found for your criteria.</Alert>
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-blue-500 hover:underline">
            Try a new search
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-3xl font-bold text-center text-gray-800 dark:text-white">
        Flight Search Results
      </h1>

      {/* Sorting Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          Sort by:
        </span>
        <button
          onClick={() => handleSortChange("price")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${
              sortCriteria === "price"
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            }`}>
          Price {sortCriteria === "price" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => handleSortChange("duration")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${
              sortCriteria === "duration"
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            }`}>
          Duration{" "}
          {sortCriteria === "duration" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => handleSortChange("segments")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${
              sortCriteria === "segments"
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            }`}>
          Stops{" "}
          {sortCriteria === "segments" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Displaying {processedOffers.length} of {flightOffers.length} flight
        offers. Page {currentPage} of {totalPages}.
      </div>
      <div className="space-y-6">
        {processedOffers.map((offer) => (
          <FlightOfferCard
            key={offer.id}
            offer={offer}
            dictionaries={dictionaries}
            onSelectOffer={handleSelectOffer}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:opacity-60">
            Previous
          </button>
          {[...Array(totalPages).keys()].map((num) => (
            <button
              key={num + 1}
              onClick={() => setCurrentPage(num + 1)}
              className={`px-4 py-2 rounded-md
                ${
                  currentPage === num + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}>
              {num + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:opacity-60">
            Next
          </button>
        </div>
      )}
    </Container>
  );
};

export default FlightResultsPage;
