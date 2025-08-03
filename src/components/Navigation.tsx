"use client";

import { useAuthStore, useCartStore } from "../stores/index";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navigation() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { totalItems, toggleCart } = useCartStore();

  // State for localStorage cart count
  const [localCartCount, setLocalCartCount] = useState(0);

  // Get localStorage cart count
  const getLocalStorageCartCount = (): number => {
    if (typeof window === "undefined") return 0;
    try {
      const cart = localStorage.getItem("local-cart");
      if (!cart) return 0;
      const items = JSON.parse(cart);
      return items.reduce(
        (total: number, item: any) => total + item.quantity,
        0
      );
    } catch (error) {
      console.error("Error reading localStorage cart count:", error);
      return 0;
    }
  };

  // Update localStorage cart count
  useEffect(() => {
    if (!isAuthenticated) {
      const count = getLocalStorageCartCount();
      setLocalCartCount(count);
    }
  }, [isAuthenticated]);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      if (!isAuthenticated) {
        const count = getLocalStorageCartCount();
        setLocalCartCount(count);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    // You might want to redirect to login page here
    window.location.href = "/login";
  };

  // Use appropriate cart count based on authentication status
  const displayCartCount = isAuthenticated ? totalItems : localCartCount;

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Kombee</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              Products
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                />
              </svg>
              {displayCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {displayCartCount > 99 ? "99+" : displayCartCount}
                </span>
              )}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span>Welcome, {user.email}</span>
                  {user.isStaff && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      Staff
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 transition-colors duration-200 text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
