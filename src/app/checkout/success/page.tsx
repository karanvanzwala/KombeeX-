"use client";

import Layout from "../../../components/Layout";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
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

            {/* Success Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. We've received your order and will
              process it shortly. You'll receive a confirmation email with
              tracking details.
            </p>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Order Details
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Order #:{" "}
                  {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
                <p>Date: {new Date().toLocaleDateString()}</p>
                <p>Status: Processing</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                What's Next?
              </h3>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  You'll receive an order confirmation email
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  We'll process and ship your order within 2-3 business days
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  You'll get tracking information once shipped
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/products"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 block"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 block"
              >
                Back to Home
              </Link>
            </div>

            {/* Support */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">
                Need help? Contact our support team
              </p>
              <div className="flex justify-center space-x-4 text-xs">
                <a
                  href="mailto:support@kombee.com"
                  className="text-blue-600 hover:underline"
                >
                  Email Support
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href="tel:+1-800-KOMBEE"
                  className="text-blue-600 hover:underline"
                >
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
