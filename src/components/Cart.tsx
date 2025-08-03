"use client";

import { useCartStore, useAuthStore } from "../stores/index";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    id: string;
    name: string;
    sku: string;
  };
}

export default function Cart() {
  const {
    items,
    isOpen,
    totalItems,
    totalPrice,
    removeItem,
    updateQuantity,
    clearCart,
    closeCart,
    addItemToLocalStorage,
    syncLocalStorageCart,
  } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  // State for localStorage cart items
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);
  const [localCartTotal, setLocalCartTotal] = useState(0);
  const [localCartTotalItems, setLocalCartTotalItems] = useState(0);

  // Get localStorage cart items
  const getLocalStorageCart = (): CartItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const cart = localStorage.getItem("local-cart");
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error("Error reading localStorage cart:", error);
      return [];
    }
  };

  // Update localStorage cart
  const updateLocalStorageCart = (items: CartItem[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("local-cart", JSON.stringify(items));
    } catch (error) {
      console.error("Error writing to localStorage cart:", error);
    }
  };

  // Remove item from localStorage cart
  const removeLocalCartItem = (itemId: string) => {
    const updatedItems = localCartItems.filter((item) => item.id !== itemId);
    setLocalCartItems(updatedItems);
    updateLocalStorageCart(updatedItems);
  };

  // Update quantity in localStorage cart
  const updateLocalCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeLocalCartItem(itemId);
      return;
    }

    const updatedItems = localCartItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setLocalCartItems(updatedItems);
    updateLocalStorageCart(updatedItems);
  };

  // Clear localStorage cart
  const clearLocalCart = () => {
    setLocalCartItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("local-cart");
    }
  };

  // Load localStorage cart items on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      const localItems = getLocalStorageCart();
      setLocalCartItems(localItems);
    }
  }, [isAuthenticated]);

  // Listen for custom events to open cart
  useEffect(() => {
    const handleOpenCart = () => {
      // This will be handled by the cart store's openCart method
      // The cart store should already be listening for this event
    };

    window.addEventListener("openCart", handleOpenCart);
    return () => {
      window.removeEventListener("openCart", handleOpenCart);
    };
  }, []);

  // Sync localStorage cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      syncLocalStorageCart();
    }
  }, [isAuthenticated, syncLocalStorageCart]);

  // Calculate localStorage cart totals
  useEffect(() => {
    const total = localCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalItems = localCartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    setLocalCartTotal(total);
    setLocalCartTotalItems(totalItems);
  }, [localCartItems]);

  if (!isOpen) return null;

  // Use appropriate cart data based on authentication status
  const displayItems = isAuthenticated ? items : localCartItems;
  const displayTotalItems = isAuthenticated ? totalItems : localCartTotalItems;
  const displayTotalPrice = isAuthenticated ? totalPrice : localCartTotal;
  const handleRemoveItem = isAuthenticated ? removeItem : removeLocalCartItem;
  const handleUpdateQuantity = isAuthenticated
    ? updateQuantity
    : updateLocalCartQuantity;
  const handleClearCart = isAuthenticated ? clearCart : clearLocalCart;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      closeCart();
      router.push("/login");
      return;
    }

    // Navigate to checkout page
    closeCart();
    router.push("/checkout");
  };

  const handleLoginRedirect = () => {
    closeCart();
    router.push("/login");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
        onClick={closeCart}
      />

      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Shopping Cart
              </h2>
              {isAuthenticated && (
                <p className="text-sm text-blue-600 mt-1">{user?.email}</p>
              )}
              {!isAuthenticated && (
                <p className="text-sm text-yellow-600 mt-1">Guest Cart</p>
              )}
            </div>
            <button
              onClick={closeCart}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {displayItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-4">
                  Add some beautiful pieces to get started!
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    router.push("/products");
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-2xl">💎</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      {item.variant && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.variant.name}
                        </p>
                      )}
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4"
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
                      <span className="text-sm font-medium text-gray-900 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4"
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

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {displayItems.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-white">
              {/* Summary */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">
                  {displayTotalItems}{" "}
                  {displayTotalItems === 1 ? "item" : "items"}
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  ${displayTotalPrice.toFixed(2)}
                </span>
              </div>

              {/* Login Prompt */}
              {!isAuthenticated && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-yellow-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span className="text-sm text-yellow-800">
                      Please login to checkout
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    isAuthenticated
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                  disabled={!isAuthenticated}
                >
                  {isAuthenticated
                    ? "Proceed to Checkout"
                    : "Login to Checkout"}
                </button>

                {!isAuthenticated && (
                  <button
                    onClick={handleLoginRedirect}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Login
                  </button>
                )}

                <button
                  onClick={handleClearCart}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
