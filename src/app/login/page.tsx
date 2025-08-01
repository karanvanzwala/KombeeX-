"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import client from "../../../lib/apollo-client";
import { LOGIN_MUTATION } from "../../../graphql/LOGIN_MUTATION";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/index";

interface LoginFormData {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, setLoading, setError, clearError, isAuthenticated } =
    useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/products");
    }
  }, [isAuthenticated, router]);

  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION, {
    client,
    onCompleted: (data) => {
      if (data.tokenCreate.token) {
        // Use Zustand store to handle login
        login(data.tokenCreate.token, data.tokenCreate.user);

        setIsSuccess(true);
        setValidationErrors({});

        // Redirect to products page after successful login
        setTimeout(() => {
          router.push("/products");
        }, 1500);
      }
    },
    onError: (error) => {
      setError("Network error. Please try again.");
      setValidationErrors({
        general: "Network error. Please try again.",
      });
    },
  });

  // Sync loading state with store
  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 3) return "Password must be at least 6 characters";
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Clear general error when user starts typing
    if (validationErrors.general) {
      clearError();
      setValidationErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await loginMutation({
        variables: {
          email: formData.email,
          password: formData.password,
        },
      });

      const { tokenCreate } = response.data;

      if (tokenCreate.errors && tokenCreate.errors.length > 0) {
        // Handle GraphQL errors
        const errors: ValidationErrors = {};
        tokenCreate.errors.forEach((error: any) => {
          if (error.field === "email") {
            errors.email = error.message;
          } else if (error.field === "password") {
            errors.password = error.message;
          } else {
            errors.general = error.message;
          }
        });
        setValidationErrors(errors);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle gradient blobs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-300 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-300 rounded-full animate-float animation-delay-1000 opacity-40"></div>
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-pink-300 rounded-full animate-float animation-delay-2000 opacity-50"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-blue-300 rounded-full animate-float animation-delay-3000 opacity-30"></div>
        <div className="absolute top-60 left-60 w-1 h-1 bg-purple-300 rounded-full animate-float animation-delay-4000 opacity-40"></div>
        <div className="absolute bottom-60 right-60 w-1.5 h-1.5 bg-pink-300 rounded-full animate-float animation-delay-5000 opacity-50"></div>

        {/* Geometric shapes */}
        <div className="absolute top-32 right-20 w-8 h-8 border border-blue-200 rotate-45 animate-spin-slow opacity-30"></div>
        <div className="absolute bottom-32 left-20 w-6 h-6 border border-purple-200 rotate-45 animate-spin-slow animation-delay-2000 opacity-25"></div>
        <div className="absolute top-80 left-20 w-4 h-4 border border-pink-200 rotate-45 animate-spin-slow animation-delay-4000 opacity-20"></div>

        {/* Wave effect */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/20 to-transparent animate-wave"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Light rays */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-200/20 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-200/20 to-transparent animate-pulse animation-delay-1000"></div>
        <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-pink-200/20 to-transparent animate-pulse animation-delay-2000"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 p-8 transform transition-all duration-500">
          {/* Success State */}
          {isSuccess && (
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">
                Login Successful!
              </h1>
              <p className="text-gray-600">Redirecting to products...</p>
            </div>
          )}

          {/* Login Form */}
          {!isSuccess && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2 animate-fade-in">
                  Welcome Back
                </h1>
                <p className="text-gray-600 animate-fade-in animation-delay-200">
                  Sign in to your account
                </p>
              </div>

              {/* General Error Message */}
              {validationErrors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-red-700 text-sm font-medium">
                      {validationErrors.general}
                    </span>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2 animate-fade-in animation-delay-300"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:bg-gray-100 ${
                        validationErrors.email
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-200"
                      }`}
                      placeholder="Enter your email"
                      required
                    />
                    {validationErrors.email && (
                      <div className="absolute -bottom-6 left-0 text-red-500 text-xs flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {validationErrors.email}
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2 animate-fade-in animation-delay-400"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={`w-full px-4 py-3 pr-12 bg-gray-50 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:bg-gray-100 ${
                        validationErrors.password
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-200"
                      }`}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                    {validationErrors.password && (
                      <div className="absolute -bottom-6 left-0 text-red-500 text-xs flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {validationErrors.password}
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between animate-fade-in animation-delay-500">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-200 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in animation-delay-600"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              {/* <div className="text-center mt-6 animate-fade-in animation-delay-700">
                <p className="text-gray-600">
                  Don&apos;t have an account?{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Sign up
                  </a>
                </p>
              </div> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
