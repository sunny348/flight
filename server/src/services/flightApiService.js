import dotenv from "dotenv";
import Amadeus from "amadeus"; // Import Amadeus SDK

dotenv.config();

// Initialize Amadeus SDK client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  // hostname: 'production' // Uncomment for production environment, default is test
});

const generateMockFlightOffer = (
  searchParams,
  index,
  baseTimeOffsetHours = 0
) => {
  const { origin, destination, departureDate, returnDate, adults, cabinClass } =
    searchParams;
  const mockId = `mock-${Date.now()}-${index}`;

  const baseDepartureDateTime = new Date(`${departureDate}T09:00:00`);
  baseDepartureDateTime.setHours(
    baseDepartureDateTime.getHours() + baseTimeOffsetHours + index
  ); // Vary departure time

  const departureDateTime = baseDepartureDateTime.toISOString().slice(0, 19);

  const baseArrivalDateTime = new Date(baseDepartureDateTime);
  baseArrivalDateTime.setHours(
    baseArrivalDateTime.getHours() + 2 + Math.floor(Math.random() * 2)
  ); // Vary duration slightly
  const arrivalDateTime = baseArrivalDateTime.toISOString().slice(0, 19);

  let returnDepartureDateTime = null;
  let returnArrivalDateTime = null;
  if (returnDate) {
    const baseReturnDepartureDateTime = new Date(`${returnDate}T14:00:00`);
    baseReturnDepartureDateTime.setHours(
      baseReturnDepartureDateTime.getHours() + baseTimeOffsetHours + index
    );
    returnDepartureDateTime = baseReturnDepartureDateTime
      .toISOString()
      .slice(0, 19);

    const baseReturnArrivalDateTime = new Date(baseReturnDepartureDateTime);
    baseReturnArrivalDateTime.setHours(
      baseReturnArrivalDateTime.getHours() + 2 + Math.floor(Math.random() * 2)
    );
    returnArrivalDateTime = baseReturnArrivalDateTime
      .toISOString()
      .slice(0, 19);
  }

  const resolvedCabinClass = cabinClass?.toUpperCase() || "ECONOMY";
  const basePrice = 150 + Math.random() * 50 + index * 10; // Vary base price

  const travelerPricings = [];
  for (let i = 1; i <= adults; i++) {
    travelerPricings.push({
      travelerId: String(i),
      fareOption: "STANDARD",
      travelerType: "ADULT",
      price: {
        currency: "USD",
        total: (resolvedCabinClass === "BUSINESS"
          ? basePrice * 2
          : resolvedCabinClass === "FIRST"
          ? basePrice * 3
          : basePrice + Math.random() * 20
        ).toFixed(2),
        base: (resolvedCabinClass === "BUSINESS"
          ? basePrice * 1.8
          : resolvedCabinClass === "FIRST"
          ? basePrice * 2.5
          : basePrice
        ).toFixed(2),
      },
      fareDetailsBySegment: [
        {
          segmentId: "1",
          cabin: resolvedCabinClass,
          fareBasis: "MOCKFARE",
          class:
            resolvedCabinClass === "BUSINESS"
              ? "J"
              : resolvedCabinClass === "FIRST"
              ? "F"
              : "M",
          includedCheckedBags: {
            quantity: resolvedCabinClass === "ECONOMY" ? 1 : 2,
          },
        },
        ...(returnDate
          ? [
              {
                segmentId: "2",
                cabin: resolvedCabinClass,
                fareBasis: "MOCKFARE",
                class:
                  resolvedCabinClass === "BUSINESS"
                    ? "J"
                    : resolvedCabinClass === "FIRST"
                    ? "F"
                    : "M",
                includedCheckedBags: {
                  quantity: resolvedCabinClass === "ECONOMY" ? 1 : 2,
                },
              },
            ]
          : []),
      ],
    });
  }

  // Calculate total price from traveler pricings for consistency
  const totalOfferPrice = travelerPricings
    .reduce((sum, tp) => sum + parseFloat(tp.price.total), 0)
    .toFixed(2);
  const totalBasePrice = travelerPricings
    .reduce((sum, tp) => sum + parseFloat(tp.price.base), 0)
    .toFixed(2);

  return {
    type: "flight-offer",
    id: mockId,
    source: "GDS_MOCK_GENERATED",
    instantTicketingRequired: false,
    nonHomogeneous: false,
    oneWay: !returnDate,
    lastTicketingDate: departureDate,
    numberOfBookableSeats: 9,
    itineraries: [
      {
        duration: `PT${Math.floor(Math.random() * 1) + 2}H${String(
          Math.floor(Math.random() * 60)
        ).padStart(2, "0")}M`, // Duration slightly randomized
        segments: [
          {
            departure: { iataCode: origin, at: departureDateTime },
            arrival: { iataCode: destination, at: arrivalDateTime },
            carrierCode: index % 2 === 0 ? "MM" : "MK", // Alternate mock carriers
            number: `${String(100 + index).padStart(3, "0")}`, // Vary flight number
            aircraft: { code: index % 2 === 0 ? "320" : "738" }, // Alternate aircraft
            duration: `PT${Math.floor(Math.random() * 1) + 2}H${String(
              Math.floor(Math.random() * 60)
            ).padStart(2, "0")}M`,
            id: "1",
            numberOfStops: 0,
          },
        ],
      },
      ...(returnDate
        ? [
            {
              duration: `PT${Math.floor(Math.random() * 1) + 2}H${String(
                Math.floor(Math.random() * 60)
              ).padStart(2, "0")}M`,
              segments: [
                {
                  departure: {
                    iataCode: destination,
                    at: returnDepartureDateTime,
                  },
                  arrival: { iataCode: origin, at: returnArrivalDateTime },
                  carrierCode: index % 2 === 0 ? "MM" : "MK",
                  number: `${String(200 + index).padStart(3, "0")}`,
                  aircraft: { code: index % 2 === 0 ? "320" : "738" },
                  duration: `PT${Math.floor(Math.random() * 1) + 2}H${String(
                    Math.floor(Math.random() * 60)
                  ).padStart(2, "0")}M`,
                  id: "2",
                  numberOfStops: 0,
                },
              ],
            },
          ]
        : []),
    ],
    price: {
      currency: "USD",
      total: totalOfferPrice,
      base: totalBasePrice,
      fees: [
        { amount: "0.00", type: "SUPPLIER" },
        { amount: "0.00", type: "TICKETING" },
      ],
      grandTotal: totalOfferPrice,
    },
    pricingOptions: {
      fareType: ["PUBLISHED"],
      includedCheckedBagsOnly: true,
    },
    validatingAirlineCodes: [index % 2 === 0 ? "MM" : "MK"],
    travelerPricings: travelerPricings,
  };
};

const generateMockFlightData = (searchParams) => {
  const { origin, destination } = searchParams;
  const numberOfOffers = Math.floor(Math.random() * 3) + 3; // Generate 3 to 5 offers
  const offers = [];

  for (let i = 0; i < numberOfOffers; i++) {
    // Pass a slightly different base time offset for each offer to vary times
    offers.push(generateMockFlightOffer(searchParams, i, i * 0.5));
  }

  return {
    meta: { count: offers.length },
    data: offers,
    dictionaries: {
      locations: {
        [origin]: { cityCode: origin, countryCode: "XX" },
        [destination]: { cityCode: destination, countryCode: "YY" },
      },
      aircraft: {
        320: "AIRBUS A320 (MOCK)",
        738: "BOEING 737-800 (MOCK)",
      },
      currencies: { USD: "US DOLLAR" },
      carriers: {
        MM: "Mock Mirlines",
        MK: "Mock Air",
      },
    },
  };
};

/**
 * Searches for flights based on the provided criteria using Amadeus API.
 *
 * @param {object} searchParams
 * @param {string} searchParams.origin - Departure airport code (e.g., "LHR")
 * @param {string} searchParams.destination - Arrival airport code (e.g., "JFK")
 * @param {string} searchParams.departureDate - Departure date (YYYY-MM-DD)
 * @param {string} [searchParams.departureTime] - Optional departure time (HH:MM:SS)
 * @param {string} [searchParams.returnDate] - Optional return date (YYYY-MM-DD)
 * @param {number} searchParams.adults - Number of adult passengers
 * @param {string} [searchParams.cabinClass] - Optional (e.g., ECONOMY, BUSINESS)
 * @param {number} [searchParams.maxResults] - Optional max number of offers (e.g., 5)
 * @returns {Promise<Array<object>>} A promise that resolves to an array of flight offers from Amadeus.
 */
export const searchFlights = async (searchParams) => {
  const {
    origin,
    destination,
    departureDate,
    departureTime,
    returnDate,
    adults,
    cabinClass,
    maxResults = 50,
  } = searchParams;

  console.log(
    "Attempting flight search with Amadeus example structure. Params:",
    searchParams
  );

  try {
    const originDestinations = [
      {
        id: "1",
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDateTimeRange: {
          date: departureDate,
          time: departureTime ? `${departureTime}:00` : "00:00:00",
        },
      },
    ];

    if (returnDate) {
      originDestinations.push({
        id: "2",
        originLocationCode: destination,
        destinationLocationCode: origin,
        departureDateTimeRange: {
          date: returnDate,
          time: "00:00:00",
        },
      });
    }

    const travelers = [];
    for (let i = 0; i < adults; i++) {
      travelers.push({
        id: (i + 1).toString(),
        travelerType: "ADULT",
      });
    }

    const apiParams = {
      currencyCode: "USD",
      originDestinations: originDestinations,
      travelers: travelers,
      sources: ["GDS"],
      searchCriteria: {
        maxFlightOffers: maxResults,
        ...(cabinClass &&
          cabinClass.toUpperCase() !== "ANY" && {
            flightFilters: {
              cabinRestrictions: [
                {
                  cabin: cabinClass.toUpperCase(),
                  coverage: "MOST_SEGMENTS",
                  originDestinationIds: originDestinations.map((od) => od.id),
                },
              ],
            },
          }),
      },
    };

    console.log("Amadeus API POST body:", JSON.stringify(apiParams, null, 2));
    const amadeusResponse = await amadeus.shopping.flightOffersSearch.post(
      JSON.stringify(apiParams)
    );

    // amadeusResponse object from SDK should contain amadeusResponse.data (offers array)
    // and amadeusResponse.dictionaries (dictionaries object)
    if (amadeusResponse.data && amadeusResponse.data.length > 0) {
      console.log(
        `Found ${amadeusResponse.data.length} real flight offers from Amadeus.`
      );
      return amadeusResponse; // Return the entire Amadeus SDK response object
    }

    console.warn(
      "No real flight offers found from Amadeus (Amadeus API returned zero offers). Generating mock data as fallback."
    );
    return generateMockFlightData(searchParams); // Return the full mock data object
  } catch (error) {
    console.error(
      "Amadeus API call failed. Generating mock data as fallback.",
      error.response?.data || error.message || error
    );
    // Ensure the error object has a statusCode if possible for the controller
    if (error.response && error.response.statusCode) {
      error.statusCode = error.response.statusCode;
    }
    // Re-throw or handle error appropriately for the controller
    // For now, falling back to mock for any error.
    return generateMockFlightData(searchParams); // Return the full mock data object
  }
};

// You might add other functions here later, e.g.:
// export const getFlightOfferPrice = async (flightOffer) => { ... };
// export const createFlightOrder = async (flightOffer, travelerInfo) => { ... };
