import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  IconPlane,
  IconCalendar,
  IconUser,
  IconSearch,
  IconClock,
} from "../components/ui/Icons";
import { FadeIn, SlideUp } from "../components/ui/Animation";
import flightCodes from "../lib/flight-codes";

const FlightSearchPage = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState(null);
  const [departureTime, setDepartureTime] = useState("09:00");
  const [returnDate, setReturnDate] = useState(null);
  const [adults, setAdults] = useState(1);
  const [cabinClass, setCabinClass] = useState("ECONOMY");
  const [isSearchFormValid, setIsSearchFormValid] = useState(false);

  // Validate form whenever inputs change
  useEffect(() => {
    setIsSearchFormValid(origin && destination && departureDate && adults > 0);
  }, [origin, destination, departureDate, adults]);

  const formatDate = (date) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isSearchFormValid) {
      toast.warn(
        "Please fill in Origin, Destination, Departure Date, and Adults."
      );
      return;
    }

    const params = {
      origin,
      destination,
      departureDate: formatDate(departureDate),
      departureTime: departureTime,
      returnDate: formatDate(returnDate),
      adults,
      cabinClass,
    };

    // Navigate to FlightResultsPage with search parameters
    navigate("/flight-results", { state: { searchParams: params } });
  };

  // Custom input for the datepicker
  const CustomDateInput = ({
    value,
    onClick,
    placeholder,
    label,
    disabled,
  }) => (
    <div>
      {label && (
        <div className="text-sm font-medium text-gray-700 dark:text-black mb-1">
          {label}
        </div>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IconCalendar className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
          placeholder={placeholder}
          value={value}
          onClick={onClick}
          readOnly
          disabled={disabled}
        />
      </div>
    </div>
  );

  return (
    <div>
      {/* Hero section */}
      <div className="relative overflow-hidden mb-10 rounded-3xl bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-primary-900 opacity-20 z-0"></div>
        <div className="relative z-10 px-6 py-16 md:py-24 text-center">
          <SlideUp>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
              Find Your Perfect Flight
            </h1>
          </SlideUp>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-black/90 max-w-2xl mx-auto">
              Compare thousands of flights from trusted airlines around the
              world
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Search form */}
      <Card className="mb-10 -mt-10 mx-auto max-w-6xl z-20 relative shadow-lg overflow-visible">
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-visible">
          {/* Main grid for the first 6 inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <div>
              <label
                htmlFor="origin"
                className="block text-sm font-medium text-gray-700 dark:text-black-300 mb-1">
                From
              </label>
              <select
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <option
                  value=""
                  disabled>
                  Select city or airport
                </option>
                {flightCodes.map((code) => (
                  <option
                    key={code.iata}
                    value={code.iata}>
                    {code.city} ({code.iata})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none -mt-8">
                <IconPlane className="transform -rotate-45 text-gray-400" />
              </div>
            </div>

            <div>
              <label
                htmlFor="destination"
                className="block text-sm font-medium text-gray-700 dark:text-black-300 mb-1">
                To
              </label>
              <select
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <option
                  value=""
                  disabled>
                  Select city or airport
                </option>
                {flightCodes.map((code) => (
                  <option
                    key={code.iata}
                    value={code.iata}>
                    {code.city} ({code.iata})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none -mt-8">
                <IconPlane className="transform rotate-45 text-gray-400" />
              </div>
            </div>

            <div>
              <DatePicker
                id="departureDate"
                selected={departureDate}
                onChange={(date) => setDepartureDate(date)}
                required
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                placeholderText="YYYY-MM-DD"
                autoComplete="off"
                popperPlacement="bottom"
                customInput={
                  <CustomDateInput
                    label="Departure Date"
                    placeholder="Select date"
                  />
                }
              />
            </div>

            {/* Departure Time Input - Stays next to Departure Date */}
            <div>
              <label
                htmlFor="departureTime"
                className="block text-sm font-medium text-gray-700 dark:text-black mb-1">
                Departure Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconClock className="text-gray-400" />
                </div>
                <input
                  type="time"
                  id="departureTime"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <DatePicker
                id="returnDate"
                selected={returnDate}
                onChange={(date) => setReturnDate(date)}
                dateFormat="yyyy-MM-dd"
                minDate={departureDate || new Date()}
                placeholderText="YYYY-MM-DD"
                autoComplete="off"
                popperPlacement="bottom"
                customInput={
                  <CustomDateInput
                    label="Return Date"
                    placeholder="Select date (optional)"
                  />
                }
              />
            </div>

            <div>
              <label
                htmlFor="adults"
                className="block text-sm font-medium text-gray-700 dark:text-black mb-1">
                Passengers
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconUser className="text-gray-400" />
                </div>
                <select
                  id="adults"
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value))}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <option
                      key={num}
                      value={num}>
                      {num} {num === 1 ? "passenger" : "passengers"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cabin Class - Spans full width on its own row */}
          <div className="mb-6">
            <label
              htmlFor="cabinClass"
              className="block text-sm font-medium text-gray-700 dark:text-black mb-1">
              Cabin Class
            </label>
            <select
              id="cabinClass"
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm dark:bg-gray-800 dark:border-black-700 dark:text-white">
              <option value="ECONOMY">Economy</option>
              <option value="PREMIUM_ECONOMY">Premium Economy</option>
              <option value="BUSINESS">Business</option>
              <option value="FIRST">First</option>
            </select>
          </div>

          <div className="flex justify-center mt-6">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!isSearchFormValid}
              className= "text-black"
                          icon={<IconSearch />}>
              Search Flights
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FlightSearchPage;
