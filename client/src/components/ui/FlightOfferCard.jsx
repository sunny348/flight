import React, { useState } from "react";
import Card, { CardBody } from "./Card"; // Assuming Card components are in the same directory or adjust path
import Button from "./Button";
import {
  IconPlane,
  IconCurrency,
  IconArrowRight,
  IconChevronDown,
} from "./Icons"; // Assuming Icons are in the same directory or adjust path
import { HoverScale } from "./Animation"; // Assuming Animation is in the same directory or adjust path

// Modernized flight offer card component
const FlightOfferCard = ({ offer, onSelectOffer, dictionaries }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Added dictionaries prop
  const firstItinerary = offer.itineraries?.[0];
  const firstSegment = firstItinerary?.segments?.[0];

  // Helper to get carrier name from dictionaries if available
  const getCarrierName = (carrierCode) => {
    return dictionaries?.carriers?.[carrierCode] || carrierCode;
  };

  const getAircraftName = (aircraftCode) => {
    return dictionaries?.aircraft?.[aircraftCode] || aircraftCode;
  };

  // Helper to get location name (e.g. city) from dictionaries if available
  const getLocationName = (iataCode) => {
    return dictionaries?.locations?.[iataCode]?.cityCode || iataCode;
  };

  if (!firstItinerary || !firstSegment) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <CardBody>
          <p className="text-red-700 dark:text-red-300">Invalid flight data</p>
        </CardBody>
      </Card>
    );
  }

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDuration = (duration) => {
    if (!duration) return "N/A";
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return duration; // Return original if parsing fails
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    if (hours === 0 && minutes === 0) return duration; // fallback if regex matched but no H or M
    return `${hours}h ${minutes}m`;
  };

  const totalStops = firstItinerary.segments.length - 1;

  const getFareDetailsForSegment = (segmentId) => {
    const travelerPricing = offer.travelerPricings?.[0];
    return travelerPricing?.fareDetailsBySegment?.find(
      (fd) => fd.segmentId === segmentId
    );
  };

  return (
    <HoverScale scale={1.02}>
      <Card
        withHover
        withBorder
        className="overflow-hidden">
        {/* Clickable main content area to toggle expansion */}
        <div
          className="p-4 md:p-6 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-4 flex-grow">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary-600 dark:text-primary-400">
                  {firstSegment.carrierCode}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {getCarrierName(firstSegment.carrierCode)} -{" "}
                  {firstSegment.number}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {offer.itineraries.length > 1 ? "Round trip" : "One way"} -{" "}
                  {totalStops === 0
                    ? "Direct"
                    : `${totalStops} stop${totalStops > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <IconChevronDown
              className={`w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                isExpanded ? "transform rotate-180" : ""
              }`}
            />
          </div>

          {/* Simplified summary display - details moved to expanded view if complex */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatTime(firstSegment.departure.at)}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {getLocationName(firstSegment.departure.iataCode)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(firstSegment.departure.at)}
              </p>
            </div>

            <div className="flex-1 mx-4">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-300 dark:border-gray-600 w-full"></div>
                <div className="absolute flex flex-col items-center">
                  <IconPlane className="w-5 h-5 text-primary-500 transform rotate-90" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-secondary-900 px-2 mt-1">
                    {getDuration(firstItinerary.duration)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatTime(firstSegment.arrival.at)}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {getLocationName(firstSegment.arrival.iataCode)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(firstSegment.arrival.at)}
              </p>
            </div>
          </div>
        </div>

        {/* Expanded Details Section */}
        {isExpanded && (
          <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Flight Details:
            </h3>
            {offer.itineraries.map((itinerary, itiIndex) => (
              <div
                key={itiIndex}
                className="mb-4 last:mb-0">
                <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {offer.itineraries.length > 1
                    ? `Leg ${itiIndex + 1}`
                    : "Itinerary"}{" "}
                  (Total duration: {getDuration(itinerary.duration)})
                </h4>
                {itinerary.segments.map((segment, segIndex) => {
                  const fareDetails = getFareDetailsForSegment(segment.id);
                  return (
                    <div
                      key={segIndex}
                      className="mb-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold text-primary-600 dark:text-primary-400">
                          {getCarrierName(segment.carrierCode)} {segment.number}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Duration: {getDuration(segment.duration)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <span className="font-medium">Departs:</span>{" "}
                          {getLocationName(segment.departure.iataCode)} (
                          {segment.departure.iataCode})
                          <br />{" "}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDateTime(segment.departure.at)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Arrives:</span>{" "}
                          {getLocationName(segment.arrival.iataCode)} (
                          {segment.arrival.iataCode})
                          <br />{" "}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDateTime(segment.arrival.at)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Aircraft:</span>{" "}
                          {getAircraftName(segment.aircraft?.code)} (
                          {segment.aircraft?.code})
                        </div>
                        {segment.operating?.carrierCode &&
                          segment.operating.carrierCode !==
                            segment.carrierCode && (
                            <div>
                              <span className="font-medium">Operated by:</span>{" "}
                              {getCarrierName(segment.operating.carrierCode)}
                            </div>
                          )}
                        {fareDetails && (
                          <>
                            <div>
                              <span className="font-medium">Cabin:</span>{" "}
                              {fareDetails.cabin} ({fareDetails.class})
                            </div>
                            <div>
                              <span className="font-medium">Fare Basis:</span>{" "}
                              {fareDetails.fareBasis}
                            </div>
                            <div>
                              <span className="font-medium">Bags:</span>{" "}
                              {fareDetails.includedCheckedBags?.quantity ||
                                "N/A"}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Footer with Price and Select Button (remains outside the clickable toggle area) */}
        <div
          className={`p-4 md:p-6 ${
            isExpanded
              ? "border-t border-gray-200 dark:border-gray-700"
              : "mt-0 pt-0 md:pt-0"
          } flex items-center justify-between`}>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <IconCurrency className="w-5 h-5 mr-1 text-green-500" />
              {offer.price?.grandTotal || offer.price?.total}{" "}
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                {offer.price?.currency}
              </span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {offer.itineraries.length > 1 ? "Round trip" : "One way"} •{" "}
              {offer.numberOfBookableSeats || 1} seat(s) available
            </p>
          </div>
          <Button
            variant="primary"
            icon={<IconArrowRight />}
            iconPosition="right"
            onClick={() => onSelectOffer(offer)}>
            Select
          </Button>
        </div>
      </Card>
    </HoverScale>
  );
};

export default FlightOfferCard;
