"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { ADD_TO_CART_MUTATION } from "../../graphql/ADD_TO_CART_MUTATION";
import client from "../../lib/apollo-client";
import { useCartStore, useAuthStore } from "../stores/index";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: any;
  showQuickView?: boolean;
  showAddToCart?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  showQuickView = true,
  showAddToCart = true,
  className = "",
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { addItem, getItemQuantity } = useCartStore();
  const { isAuthenticated } = useAuthStore();
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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(product, "product");
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: 999.99, // You might want to get this from the product data
        quantity: 1,
        image:
          product.media?.[selectedImageIndex]?.url || product.media?.[0]?.url,
        variant: product.variants?.[0]
          ? {
              id: product.variants[0].id,
              name: product.variants[0].name,
              sku: product.variants[0].sku,
            }
          : undefined,
      };

      addItem(cartItem);

      // Try to add to server cart via GraphQL
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
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const formatPrice = (price: any) => {
    if (!price?.gross?.amount) return "$999.99";
    return `$${(price.gross.amount / 100).toFixed(2)}`;
  };

  const itemQuantity = getItemQuantity(product.id);
  const isInCart = itemQuantity > 0;

  return (
    <div
      className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-slate-200 hover:border-slate-300 relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {product.media && product.media.length > 0 ? (
          <div className="relative h-full">
            {/* Main Image */}
            <img
              src={
                product.media[selectedImageIndex]?.url || product.media[0]?.url
              }
              alt={product.media[selectedImageIndex]?.alt || product.name}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isHovered ? "scale-110" : "scale-100"
              } ${isImageLoading ? "opacity-0" : "opacity-100"}`}
              onLoad={() => setIsImageLoading(false)}
            />

            {/* Loading Placeholder */}
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Image Gallery Navigation */}
            {product.media && product.media.length > 1 && (
              <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-1">
                {product.media.slice(0, 4).map((media: any, index: number) => (
                  <button
                    key={media.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      selectedImageIndex === index
                        ? "bg-white shadow-md"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Quick Actions Overlay */}
            <div
              className={`absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex space-x-2">
                {showQuickView && (
                  <Link
                    href={`/products/${product.slug || product.id}`}
                    className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-gray-100 shadow-lg"
                  >
                    Quick View
                  </Link>
                )}
                {showAddToCart && (
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAuthenticated || cartLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg ${
                      isAuthenticated
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-400 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    {cartLoading ? "Adding..." : "Add to Cart"}
                  </button>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col space-y-2">
              {/* Cart Badge */}
              {isInCart && (
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  {itemQuantity} in cart
                </div>
              )}

              {/* New Badge */}
              {Math.random() > 0.7 && (
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  New
                </div>
              )}
            </div>

            {/* Image Count Badge */}
            {product.media && product.media.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                +{product.media.length - 1}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-gray-400 text-4xl">💎</div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Category */}
        {product.category && (
          <div className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wide">
            {product.category.name}
          </div>
        )}

        {/* Product Title */}
        <Link href={`/products/${product.slug || product.id}`}>
          <h3 className="font-semibold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.variants?.[0]?.pricing?.price)}
            </span>
            {product.variants?.[0]?.pricing?.priceUndiscounted?.gross
              ?.amount !==
              product.variants?.[0]?.pricing?.price?.gross?.amount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.variants?.[0]?.pricing?.priceUndiscounted)}
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200">
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Available Options</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {product.variants.length} variants
              </span>
            </div>

            <div className="space-y-1">
              {product.variants.slice(0, 2).map((variant: any) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700 font-medium truncate">
                    {variant.name}
                  </span>
                  <span className="text-gray-500 text-xs ml-2">
                    {variant.sku}
                  </span>
                </div>
              ))}
              {product.variants.length > 2 && (
                <div className="text-xs text-blue-600 font-medium">
                  +{product.variants.length - 2} more options
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={!isAuthenticated || cartLoading}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors duration-200 ${
                isAuthenticated
                  ? isInCart
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
            >
              {cartLoading
                ? "Adding..."
                : !isAuthenticated
                ? "Login to Add"
                : isInCart
                ? "Added to Cart"
                : "Add to Cart"}
            </button>
          )}

          {showQuickView && (
            <Link
              href={`/products/${product.slug || product.id}`}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
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
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
