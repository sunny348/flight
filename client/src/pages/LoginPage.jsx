import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../lib/apiClient";
import { useAuth } from "../contexts/AuthContext";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { FadeIn, SlideUp } from "../components/ui/Animation";
import { IconEmail, IconLock, IconGoogle } from "../components/ui/Icons";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { loginUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("signupSuccess") === "true") {
      setShowSignupSuccess(true);
    }
  }, [location]);

  const standardLoginMutation = useMutation({
    mutationFn: (credentials) => apiClient.post("/auth/login", credentials),
    onSuccess: (response) => {
      toast.success("Login successful!");
      loginUser(response.data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error(errorMessage);
      console.error("Standard login error:", errorMessage, error);
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: async () => {
      const firebaseAuthResult = await signInWithPopup(auth, googleProvider);
      const idToken = await firebaseAuthResult.user.getIdToken();
      return apiClient.post("/auth/google", { idToken });
    },
    onSuccess: (response) => {
      toast.success("Logged in with Google successfully!");
      loginUser(response.data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Google login failed. Please try again.";
      toast.error(errorMessage);
      console.error("Google login error:", errorMessage, error);
    },
  });

  const handleStandardSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.warn("Email and password are required.");
      return;
    }
    standardLoginMutation.mutate({ email, password });
  };

  const handleGoogleSignIn = async () => {
    googleLoginMutation.mutate();
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-70 z-0"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent-100 dark:bg-accent-900/20 rounded-full blur-3xl opacity-70 z-0"></div>

      <FadeIn className="relative z-10 w-full max-w-md">
        <Card className="px-8 py-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Log in to your account to continue
            </p>
          </div>

          {showSignupSuccess && (
            <SlideUp className="mb-6">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  🎉 Account created successfully! Please log in with your
                  credentials.
                </p>
              </div>
            </SlideUp>
          )}

          <form
            onSubmit={handleStandardSubmit}
            className="space-y-6">
            <div className="space-y-4">
              <Input
                id="email"
                type="email"
                label="Email Address"
                icon={<IconEmail />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={
                  standardLoginMutation.isPending ||
                  googleLoginMutation.isPending
                }
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
                disabled={
                  standardLoginMutation.isPending ||
                  googleLoginMutation.isPending
                }
                required
                fullWidth
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={standardLoginMutation.isPending}
              disabled={
                standardLoginMutation.isPending || googleLoginMutation.isPending
              }>
              Log In
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-secondary-900 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                fullWidth
                loading={googleLoginMutation.isPending}
                disabled={
                  googleLoginMutation.isPending ||
                  standardLoginMutation.isPending
                }
                icon={<IconGoogle />}>
                Sign in with Google
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Sign up for free
            </Link>
          </p>
        </Card>
      </FadeIn>
    </div>
  );
};

export default LoginPage;
