"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { ADD_TO_CART_MUTATION } from "../../../../graphql/ADD_TO_CART_MUTATION";
import client from "../../../../lib/apollo-client";
import { useCartStore, useAuthStore } from "../../../stores/index";
import Layout from "../../../components/Layout";
import { useRouter } from "next/navigation";
import ProductDetailsDebug from "../../../components/ProductDetailsDebug";

interface ProductDetailsClientProps {
  product: any;
}

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.defaultVariant || product.variants?.[0]
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [addedToCartMessage, setAddedToCartMessage] = useState<string | null>(
    null
  );
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showCheckoutButton, setShowCheckoutButton] = useState(false);

  const { addItem, getItemQuantity, addItemToLocalStorage, totalItems } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // GraphQL mutation for adding to cart
  const [addToCartMutation, { loading: cartLoading }] = useMutation(
    ADD_TO_CART_MUTATION,
    {
      client,
      onCompleted: (data) => {
        console.log("GraphQL mutation completed:", data);
        if (data.checkoutCreate.checkout) {
          console.log(
            "Item added to cart via GraphQL:",
            data.checkoutCreate.checkout
          );
          setAddedToCartMessage(`${product.name} added to cart!`);
          setShowCheckoutButton(true);
          setTimeout(() => setAddedToCartMessage(null), 3000);
        } else if (
          data.checkoutCreate.errors &&
          data.checkoutCreate.errors.length > 0
        ) {
          console.error("GraphQL errors:", data.checkoutCreate.errors);
        }
      },
      onError: (error) => {
        console.error("Error adding to cart via GraphQL:", error);
        console.error(
          "Error details:",
          error.graphQLErrors,
          error.networkError
        );
        // Still show success for local cart
        setAddedToCartMessage(`${product.name} added to cart!`);
        setShowCheckoutButton(true);
        setTimeout(() => setAddedToCartMessage(null), 3000);
      },
    }
  );

  // Calculate total price based on selected variant and quantity
  const calculateTotalPrice = () => {
    const basePrice = selectedVariant?.pricing?.price?.gross?.amount || 99999; // 999.99 in cents
    return (basePrice / 100) * quantity;
  };

  // Calculate discounted price if available
  const calculateDiscountedPrice = () => {
    const originalPrice =
      selectedVariant?.pricing?.priceUndiscounted?.gross?.amount || 99999;
    const currentPrice =
      selectedVariant?.pricing?.price?.gross?.amount || 99999;
    return (originalPrice / 100) * quantity;
  };

  // Check if there's a discount
  const hasDiscount = () => {
    const originalPrice =
      selectedVariant?.pricing?.priceUndiscounted?.gross?.amount;
    const currentPrice = selectedVariant?.pricing?.price?.gross?.amount;
    return originalPrice && currentPrice && originalPrice > currentPrice;
  };

  // Get current item quantity in cart
  const getCurrentItemQuantity = () => {
    return getItemQuantity(selectedVariant?.id || product.id);
  };

  const handleAddToCart = async () => {
    if (isAddingToCart) return; // Prevent multiple clicks

    setIsAddingToCart(true);

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      setIsAddingToCart(false);
      return;
    }

    try {
      const cartItem = {
        id: selectedVariant?.id || product.id,
        name: product.name,
        price: (selectedVariant?.pricing?.price?.gross?.amount || 99999) / 100,
        quantity: quantity,
        image:
          product.media?.[selectedImageIndex]?.url || product.media?.[0]?.url,
        variant: selectedVariant
          ? {
              id: selectedVariant.id,
              name: selectedVariant.name,
              sku: selectedVariant.sku,
            }
          : undefined,
      };

      if (!isAuthenticated) {
        // Add to localStorage cart for non-authenticated users
        addItemToLocalStorage(cartItem);
        console.log("Item added to localStorage cart");
        setAddedToCartMessage(`${product.name} added to cart!`);
        setShowCheckoutButton(true);
        setTimeout(() => setAddedToCartMessage(null), 3000);
      } else {
        // Add to main cart store for authenticated users
        addItem(cartItem);

        // Try to add to server cart via GraphQL
        if (selectedVariant) {
          await addToCartMutation({
            variables: {
              input: {
                lines: [
                  {
                    quantity: quantity,
                    variantId: selectedVariant.id,
                  },
                ],
              },
            },
          });
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddedToCartMessage(`${product.name} added to cart!`);
      setShowCheckoutButton(true);
      setTimeout(() => setAddedToCartMessage(null), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const handleViewCart = () => {
    // This will open the cart sidebar
    const event = new CustomEvent("openCart");
    window.dispatchEvent(event);
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  const formatPrice = (price: any) => {
    if (!price?.gross?.amount) return "$999.99";
    return `$${(price.gross.amount / 100).toFixed(2)}`;
  };

  const isInCart = getCurrentItemQuantity() > 0;

  // Reset checkout button when variant changes
  useEffect(() => {
    setShowCheckoutButton(false);
  }, [selectedVariant]);

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

      <div className="min-h-screen bg-gradient-to-br md:mt-[50px] mt-10  from-slate-50 to-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a
                  href="/"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Home
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <a
                    href="/products"
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    Products
                  </a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-gray-500 uppercase  tracking-wide truncate">
                    {/* {product.name} */}
                    Product Details
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {product.media && product.media.length > 0 ? (
                  <img
                    src={
                      product.media[selectedImageIndex]?.url ||
                      product.media[0]?.url
                    }
                    alt={product.media[selectedImageIndex]?.alt || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-gray-400 text-6xl">💎</div>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.media && product.media.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.media.map((media: any, index: number) => (
                    <button
                      key={media.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                        selectedImageIndex === index
                          ? "border-blue-500 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={media.url}
                        alt={media.alt || product.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Product Title & Category */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                {product.category && (
                  <p className="text-gray-600">
                    Category:{" "}
                    <span className="font-medium">{product.category.name}</span>
                  </p>
                )}
              </div>

              {/* Price Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(selectedVariant?.pricing?.price)}
                  </span>
                  {hasDiscount() && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(selectedVariant?.pricing?.priceUndiscounted)}
                    </span>
                  )}
                </div>

                {/* Quantity-based pricing */}
                {quantity > 1 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-800">
                        Total for {quantity} items:
                      </span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-900">
                          ${calculateTotalPrice().toFixed(2)}
                        </span>
                        {hasDiscount() && (
                          <div className="text-sm text-blue-600 line-through">
                            ${calculateDiscountedPrice().toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isInCart && (
                  <p className="text-sm text-blue-600">
                    {getCurrentItemQuantity()} in cart
                  </p>
                )}
              </div>

              {/* Description */}
              {/* {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <div
                    className="text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )} */}

              {/* Variants */}
              {product.variants && product.variants.length > 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Select Variant
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {product.variants.map((variant: any) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                          selectedVariant?.id === variant.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {variant.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {variant.sku}
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          {formatPrice(variant.pricing?.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Attributes */}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors duration-200"
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
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span className="text-lg font-medium text-gray-900 w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors duration-200"
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={
                      !isAuthenticated ||
                      cartLoading ||
                      isAddingToCart ||
                      !product.isAvailableForPurchase
                    }
                    className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-all duration-200 ${
                      isAuthenticated &&
                      product.isAvailableForPurchase &&
                      !isAddingToCart
                        ? isInCart
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-400 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    {isAddingToCart || cartLoading
                      ? "Adding..."
                      : !isAuthenticated
                      ? "Login to Add to Cart"
                      : !product.isAvailableForPurchase
                      ? "Out of Stock"
                      : isInCart
                      ? "Added to Cart"
                      : "Add to Cart"}
                  </button>

                  {/* Checkout Button - Shows after adding to cart */}
                  {showCheckoutButton && (
                    <div className="space-y-2">
                      <button
                        onClick={handleCheckout}
                        className="w-full py-4 px-6 rounded-lg font-medium text-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                      >
                        Proceed to Checkout
                      </button>
                      <button
                        onClick={handleViewCart}
                        className="w-full py-3 px-6 rounded-lg font-medium text-blue-600 border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200"
                      >
                        View Cart ({totalItems} items)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="text-sm text-gray-600">
                {product.isAvailableForPurchase ? (
                  <div className="flex items-center text-green-600">
                    <svg
                      className="w-4 h-4 mr-1"
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
                    In Stock
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Out of Stock
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Component (Development Only) */}
      {/* <ProductDetailsDebug
        product={product}
        selectedVariant={selectedVariant}
        quantity={quantity}
        calculateTotalPrice={calculateTotalPrice}
        calculateDiscountedPrice={calculateDiscountedPrice}
        hasDiscount={hasDiscount}
      /> */}
    </Layout>
  );
}
