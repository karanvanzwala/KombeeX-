"use client";

import { useQuery, useMutation } from "@apollo/client";
import client from "../../lib/apollo-client";
import { GET_PRODUCTS } from "../../graphql/GET_PRODUCTS";
import { GET_ATTRIBUTES } from "../../graphql/GET_ATTRIBUTES";
import { ADD_TO_CART_MUTATION } from "../../graphql/ADD_TO_CART_MUTATION";
import { useState } from "react";
import { useCartStore, useAuthStore } from "../stores/index";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import Carousel from "../components/Carousel";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const {
    loading: productsLoading,
    error: productsError,
    data: productsData,
  } = useQuery(GET_PRODUCTS, { client });

  const {
    loading: attributesLoading,
    error: attributesError,
    data: attributesData,
  } = useQuery(GET_ATTRIBUTES, { client });

  console.log(attributesData, "attributesData");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [addedToCartMessage, setAddedToCartMessage] = useState<string | null>(
    null
  );

  const { addItem, totalItems, openCart, getItemQuantity } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  // GraphQL mutation for adding to cart
  const [addToCartMutation, { loading: cartLoading }] = useMutation(
    ADD_TO_CART_MUTATION,
    {
      client,
      onCompleted: (data) => {
        if (data.checkoutCreate.checkout) {
          console.log(
            "Item added to cart via GraphQL:",
            data.checkoutCreate.checkout
          );
        }
      },
      onError: (error) => {
        console.error("Error adding to cart:", error);
      },
    }
  );

  const handleAddToCart = async (product: any) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: 999.99,
        quantity: 1,
        image: product.media?.[0]?.url,
        variant: product.variants?.[0]
          ? {
              id: product.variants[0].id,
              name: product.variants[0].name,
              sku: product.variants[0].sku,
            }
          : undefined,
      };

      addItem(cartItem);

      if (product.variants && product.variants.length > 0) {
        await addToCartMutation({
          variables: {
            input: {
              lines: [
                {
                  quantity: 1,
                  variantId: product.variants[0].id,
                },
              ],
            },
          },
        });
      }

      setAddedToCartMessage(`${product.name} added to cart!`);
      setTimeout(() => setAddedToCartMessage(null), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddedToCartMessage(`${product.name} added to cart!`);
      setTimeout(() => setAddedToCartMessage(null), 2000);
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  // Generate categories from attributes data
  const generateCategories = () => {
    const categories = [
      {
        id: "all",
        name: "All Jewellery",
        icon: "💎",
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
      },
    ];

    if (attributesData?.attributes?.edges) {
      attributesData.attributes.edges.forEach(({ node }: any) => {
        const category = {
          id: node.slug || node.id,
          name: node.name,
          icon: "💎", // Default icon for all categories
          color: getRandomGradient(),
        };
        categories.push(category);
      });
    }

    return categories;
  };

  const getRandomGradient = () => {
    const gradients = [
      "bg-gradient-to-r from-yellow-500 to-orange-500",
      "bg-gradient-to-r from-blue-500 to-cyan-500",
      "bg-gradient-to-r from-pink-500 to-rose-500",
      "bg-gradient-to-r from-red-500 to-pink-500",
      "bg-gradient-to-r from-green-500 to-teal-500",
      "bg-gradient-to-r from-indigo-500 to-purple-500",
      "bg-gradient-to-r from-rose-500 to-red-500",
      "bg-gradient-to-r from-yellow-400 to-orange-400",
      "bg-gradient-to-r from-purple-500 to-indigo-500",
      "bg-gradient-to-r from-emerald-500 to-teal-500",
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const categories = generateCategories();

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

      {/* Hero Banner */}
      {/* <div className="relative bg-gradient-to-r from-purple-900 via-pink-800 to-red-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="text-white space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Festival of{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                    Diamonds
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-200">
                  UP TO 20% OFF ON 10,000+ DESIGNS
                </p>
                <p className="text-lg text-gray-300">
                  Discover our exquisite collection of fine jewelry
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg">
                  SHOP NOW
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition-colors duration-200">
                  VIEW COLLECTION
                </button>
              </div>
            </div>

          
          </div>
        </div>
      </div> */}

      {/* Hero Banner */}
      <div className="bg-[#fefcfb]">
        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          {/* Left Side: Text */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Festival of <span className="text-yellow-500">Diamonds</span>
            </h1>
            <p className="text-lg text-gray-700">
              <span className="text-red-500 font-semibold">Up to 20% OFF</span>{" "}
              on 10,000+ timeless designs
            </p>
            <p className="text-gray-500">
              Discover our hand-picked fine jewelry collection crafted for
              elegance and charm.
            </p>

            <div className="flex gap-4 mt-6">
              <button
                className="bg-black text-white cursor-pointer px-6 py-3 rounded-lg shadow hover:bg-gray-800 transition"
                onClick={() => {
                  router.push(`/products/`);
                }}
              >
                Shop Now
              </button>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className=" justify-center md:flex hidden">
            <img
              src="/ring.png" // Replace with actual image
              alt="Featured Jewelry"
              className="w-full max-w-sm "
            />
          </div>
        </div>
      </div>

      {/* Carousel Test Section */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {productsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Loading featured products...
                </p>
              </div>
            </div>
          ) : productsError ? (
            <div className="text-center py-16">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 font-medium">
                Error: {productsError.message}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsData?.products?.edges
                ?.slice(0, 8)
                .map(({ node }: any, index: number) => (
                  <ProductCard
                    key={node.id}
                    product={node}
                    className={`animate-fade-in`}
                  />
                ))}
            </div>
          )}

          {/* View All Products Button */}
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              View All Products
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Attributes Section */}
      {attributesData?.attributes?.edges && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Product Categories
              </h2>
              <p className="text-xl text-gray-600">
                Explore our diverse range of jewelry categories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {attributesData.attributes.edges.map(({ node }: any) => (
                <div
                  key={node.id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-4xl mb-4">💎</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {node.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {node.choices?.edges?.length || 0} options available
                  </p>
                  {node.choices?.edges && (
                    <div className="flex flex-wrap justify-center gap-2">
                      {node.choices.edges
                        .slice(0, 3)
                        .map(({ node: choice }: any) => (
                          <span
                            key={choice.id}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {choice.name}
                          </span>
                        ))}
                      {node.choices.edges.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{node.choices.edges.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Section */}
      {/* <div className="bg-gradient-to-r from-purple-900 to-pink-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-xl text-gray-200 mb-8">
            Get the latest updates on new collections and exclusive offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button className="bg-white text-purple-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </div> */}
    </Layout>
  );
}
