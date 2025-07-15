import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../lib/apiClient";
import { FadeIn, SlideUp } from "../components/ui/Animation";
import { IconEmail, IconLock, IconUser } from "../components/ui/Icons";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: (userData) => apiClient.post("/auth/signup", userData),
    onSuccess: () => {
      // Redirect to login with a success message
      navigate("/login?signupSuccess=true");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Signup failed. Please try again.";
      toast.error(errorMessage);
      console.error("Signup error:", errorMessage, error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    signupMutation.mutate({ name, email, password });
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-70 z-0"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent-100 dark:bg-accent-900/20 rounded-full blur-3xl opacity-70 z-0"></div>

      <FadeIn className="relative z-10 w-full max-w-md">
        <Card className="px-8 py-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create an Account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Join FlightBooker for the best travel experience
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6">
            <div className="space-y-4">
              <Input
                id="name"
                type="text"
                label="Full Name"
                icon={<IconUser />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={signupMutation.isPending}
                required
                fullWidth
                placeholder="John Doe"
              />

              <Input
                id="email"
                type="email"
                label="Email Address"
                icon={<IconEmail />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={signupMutation.isPending}
                required
                fullWidth
                placeholder="your@email.com"
              />

              <Input
                id="password"
                type="password"
                label="Password"
                icon={<IconLock />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={signupMutation.isPending}
                required
                fullWidth
                placeholder="••••••••"
              />

              <Input
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                icon={<IconLock />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={signupMutation.isPending}
                required
                fullWidth
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={signupMutation.isPending}
                disabled={signupMutation.isPending}>
                Create Account
              </Button>
            </div>

            <div className="mt-4">
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                By signing up, you agree to our{" "}
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium">
                  Privacy Policy
                </a>
              </p>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Log in
            </Link>
          </p>
        </Card>
      </FadeIn>

      {/* Benefits section */}
      <SlideUp className="mt-12 z-10 max-w-md">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Secure Booking
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your payment and personal information are always protected
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Best Prices
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We compare hundreds of airlines to find you the best deals
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              24/7 Support
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Our customer support team is available round the clock
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Easy Booking
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Book your flights in just a few clicks, hassle-free
            </p>
          </div>
        </div>
      </SlideUp>
    </div>
  );
};

export default SignupPage;
