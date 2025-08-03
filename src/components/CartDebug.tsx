"use client";

import { useEffect, useState } from "react";
import { useCartStore, useAuthStore } from "../stores/index";

export default function CartDebug() {
  const { items, totalItems, getLocalStorageCartCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [localCartCount, setLocalCartCount] = useState(0);

  useEffect(() => {
    const updateLocalCartCount = () => {
      const count = getLocalStorageCartCount();
      setLocalCartCount(count);
    };

    updateLocalCartCount();

    const handleLocalStorageCartUpdated = () => {
      updateLocalCartCount();
    };

    window.addEventListener(
      "localStorageCartUpdated",
      handleLocalStorageCartUpdated
    );
    return () => {
      window.removeEventListener(
        "localStorageCartUpdated",
        handleLocalStorageCartUpdated
      );
    };
  }, [getLocalStorageCartCount]);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-2">Cart Debug</h3>
      <div className="space-y-1">
        <div>Auth: {isAuthenticated ? "Yes" : "No"}</div>
        <div>Main Cart Items: {items.length}</div>
        <div>Main Cart Total: {totalItems}</div>
        <div>Local Cart Count: {localCartCount}</div>
        <div className="mt-2">
          <strong>Items:</strong>
          {items.map((item, index) => (
            <div key={index} className="ml-2">
              {item.name} x{item.quantity}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
