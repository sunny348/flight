import { useNavigate } from "react-router-dom";
import {
  HeroReveal,
  SlideUp,
  FadeIn,
  StaggerContainer,
  StaggerItem,
  HoverScale,
} from "../components/ui/Animation";
import {
  IconPlane,
  IconGlobe,
  IconClock,
  IconTicket,
  IconArrowRight,
  IconSearch,
} from "../components/ui/Icons";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-10 md:py-20">
        {/* Background decorations */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-100 dark:bg-accent-900/20 rounded-full blur-3xl opacity-70"></div>

        <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
          {/* Hero Content */}
          <div className="flex-1">
            <HeroReveal>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-black leading-tight">
                Discover the world,{" "}
                <span className="text-primary-500">one flight</span> at a time
              </h1>
            </HeroReveal>

            <SlideUp delay={0.2}>
              <p className="mt-6 text-xl text-gray-600 dark:text-black-300">
                Find and book your next flight with ease. We offer a seamless
                booking experience with the best prices and exclusive deals.
              </p>
            </SlideUp>

            <SlideUp delay={0.4}>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/flights")}
                  icon={<IconSearch />}>
                  Search Flights
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/signup")}>
                  Join Now
                </Button>
              </div>
            </SlideUp>

            <FadeIn delay={0.6}>
              <div className="mt-10 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-500">1000+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Flight Routes
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-500">500K+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Happy Customers
                  </p>
                </div>
  <div className="text-center">
                  <p className="text-3xl font-bold text-primary-500">150+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Destinations
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Hero Image */}
          <div className="flex-1">
            <FadeIn delay={0.3}>
              <img
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Airplane wing above clouds"
                className="w-full h-auto rounded-2xl shadow-2xl object-cover"
              />
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <StaggerContainer>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-3xl font-medium rounded-full mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-black">
            A Better Way to Book Flights
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-black-400">
            We make finding and booking flights simple and stress-free
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <StaggerItem>
            <Card
              withHover
              className="h-full">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <IconGlobe className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Global Coverage
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Access flights to over 150 destinations worldwide with our
                  comprehensive network of airline partners.
                </p>
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card
              withHover
              className="h-full">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <IconClock className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Fast Booking
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our streamlined booking process lets you search, select and
                  secure your flights in minutes.
                </p>
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card
              withHover
              className="h-full">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <IconTicket className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Best Prices
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We compare prices across hundreds of airlines to ensure you
                  always get the best deal available.
                </p>
              </div>
            </Card>
          </StaggerItem>
        </div>
      </StaggerContainer>

      {/* CTA Section */}
      <FadeIn>
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
            <div className="text-lacak mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold">
                Ready to start your journey?
              </h2>
              <p className="mt-3 text-black/80">
                Book your next flight today and experience seamless travel.
              </p>
            </div>
            <HoverScale>
              <Button
                variant="accent"
                size="lg"
                onClick={() => navigate("/flights")}
                icon={<IconArrowRight />}
                iconPosition="right">
                Find Flights Now
              </Button>
            </HoverScale>
          </div>
        </div>
      </FadeIn>

      {/* Testimonials */}
      <StaggerContainer>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm font-medium rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-black">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StaggerItem>
            <Card
              withBorder
              className="h-full">
              <div className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  "FlightBooker made finding my international flight so easy.
                  The interface is intuitive and I found a great deal in
                  minutes!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Sarah Johnson
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Travel Enthusiast
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card
              withBorder
              className="h-full">
              <div className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  "I saved over $300 on my family vacation flights using
                  FlightBooker. The customer service was also exceptional!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Michael Rodriguez
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Business Traveler
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card
              withBorder
              className="h-full">
              <div className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  "As a frequent flyer, I've tried many booking platforms.
                  FlightBooker is by far the most reliable and user-friendly
                  option."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Emily Chen
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Digital Nomad
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </StaggerItem>
        </div>
      </StaggerContainer>
  </div>
);
};

export default HomePage;
