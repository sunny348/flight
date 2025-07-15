import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../ui/Theme";
import { motion } from "framer-motion";
import { HoverScale } from "../ui/Animation";
import {
  IconPlane,
  IconUser,
  IconTicket,
  IconSearch,
  IconSun,
  IconMoon,
} from "../ui/Icons";
import Button from "../ui/Button";



const Navbar = () => {
  const { isAuthenticated, user, logoutUser, isLoading } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <motion.nav
      className="bg-white dark:bg-secondary-900 border-b border-gray-200 dark:border-gray-800 py-4 shadow-sm"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <HoverScale>
          <Link
            to="/"
            className="group flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors">
            <IconPlane className="w-7 h-7" />
            <div className="flex flex-col">
              <span className="text-xl font-bold">FlightBooker</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Travel with ease
              </span>
            </div>
          </Link>
        </HoverScale>


        <div className="flex items-center gap-6">

                 <HoverScale>
  <Link to="/login" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
    Login
  </Link>
</HoverScale>

     <HoverScale>
  <Link to="/signup" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
    Sign Up
  </Link>
</HoverScale>
          <HoverScale>
            <Link
              to="/flights"
              className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
              <IconSearch className="w-5 h-5" />
              <span>Search Flights</span>
            </Link>
          </HoverScale>


   

          {isLoading ? (
            <div className="animate-pulse w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ) : isAuthenticated ? (
            <>
              <HoverScale>
                <Link
                  to="/bookings"
                  className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  <IconTicket className="w-5 h-5" />
                  <span>My Bookings</span>
                </Link>
              </HoverScale>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IconUser className="w-5 h-5 text-primary-500" />
                <span>{user?.name || user?.email}</span>
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
{/*  
<HoverScale>
  <Link to="/login" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
    Login
  </Link>
</HoverScale>

<HoverScale>
  <Button
    variant="primary"
    size="sm"
    onClick={() => navigate("/signup")}
  >
    Sign Up
  </Button>
</HoverScale> */}



              

            </>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode">
            {darkMode ? (
              <IconSun className="w-5 h-5" />
            ) : (
              <IconMoon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-secondary-900 border-t border-gray-200 dark:border-gray-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              FlightBooker
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Find and book your next flight with ease. We offer a seamless
              booking experience with the best prices.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/flights"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm">
                  Search Flights
                </Link>
              </li>
              <li>
                <Link
                  to="/bookings"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Contact Us
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Email: support@flightbooker.com
              <br />
              Phone: +1 (555) 123-4567
              <br />
              Address: 123 Aviation Way, Sky City
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} FlightBooker. All rights reserved.
          </p>

          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400">
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const MainLayout = () => {
  const { darkMode } = useTheme();

  return (
    <div
      className={`flex flex-col min-h-screen transition-colors duration-200 ${
        darkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
