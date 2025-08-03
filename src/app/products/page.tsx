"use client";

import { useQuery, useMutation } from "@apollo/client";
import client from "../../../lib/apollo-client";
import { GET_PRODUCTS } from "../../../graphql/GET_PRODUCTS";
import { ADD_TO_CART_MUTATION } from "../../../graphql/ADD_TO_CART_MUTATION";
import { useState } from "react";
import { useCartStore, useAuthStore } from "../../stores/index";
import Layout from "../../components/Layout";
import ProductCard from "../../components/ProductCard";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const { loading, error, data } = useQuery(GET_PRODUCTS, { client });
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [addedToCartMessage, setAddedToCartMessage] = useState<string | null>(
    null
  );
  const { addItem, totalItems, openCart, getItemQuantity } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  if (loading)
    return (
      <Layout>
        <div className="min-h-screen  bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading products...</p>
          </div>
        </div>
      </Layout>
    );

  if (error)
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium">Error: {error.message}</p>
          </div>
        </div>
      </Layout>
    );

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <Layout>
      {/* Success Message */}
      {addedToCartMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
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
            {addedToCartMessage}
          </div>
        </div>
      )}

      {/* Login Prompt */}
      {showLoginPrompt && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
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
            Please login to add items to cart
            <button
              onClick={handleLoginRedirect}
              className="ml-2 underline hover:no-underline"
            >
              Login
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-7xl mt-[70px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.products.edges.map(({ node }: any, index: number) => (
            <ProductCard
              key={node.id}
              product={node}
              className="animate-fade-in"
            />
          ))}
        </div>

        {/* Empty State */}
        {data.products.edges.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">💎</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              We&apos;re working on adding more beautiful pieces to our
              collection.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
