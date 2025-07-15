import apiClient from "../lib/apiClient"; // Use the configured apiClient

const FLIGHTS_PATH = "/flights"; // Path relative to apiClient's baseURL

/**
 * Searches for flights based on the provided criteria.
 * @param {object} params - The search parameters.
 * @returns {Promise<object>} A promise that resolves to the flight search results (expected to be { data: [], dictionaries: {} }).
 */
const searchFlights = async (params) => {
  try {
    // apiClient's baseURL is /api, so this will hit /api/flights/search
    const response = await apiClient.get(`${FLIGHTS_PATH}/search`, { params });
    // apiClient returns the full axios response, so response.data is the actual data payload
    // This data payload should be the object { data: [...], dictionaries: {...} } from the backend controller
    return response.data;
  } catch (error) {
    console.error(
      "Error searching flights:",
      error.response?.data || error.message
    );
    // Re-throw the error so that react-query can handle it
    throw error.response?.data || new Error("Flight search failed");
  }
};

const flightService = {
  searchFlights,
};

export default flightService;
