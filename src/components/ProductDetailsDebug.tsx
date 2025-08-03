"use client";

import { useEffect, useState } from "react";
import { useCartStore, useAuthStore } from "../stores/index";

interface ProductDetailsDebugProps {
  product: any;
  selectedVariant: any;
  quantity: number;
  calculateTotalPrice: () => number;
  calculateDiscountedPrice: () => number;
  hasDiscount: () => boolean;
}

export default function ProductDetailsDebug({
  product,
  selectedVariant,
  quantity,
  calculateTotalPrice,
  calculateDiscountedPrice,
  hasDiscount,
}: ProductDetailsDebugProps) {
  const { items, totalItems, getItemQuantity } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [currentItemQuantity, setCurrentItemQuantity] = useState(0);

  useEffect(() => {
    const quantity = getItemQuantity(selectedVariant?.id || product.id);
    setCurrentItemQuantity(quantity);
  }, [selectedVariant, product.id, getItemQuantity]);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-2">Product Details Debug</h3>
      <div className="space-y-1">
        <div>Auth: {isAuthenticated ? "Yes" : "No"}</div>
        <div>Product ID: {product.id}</div>
        <div>Variant ID: {selectedVariant?.id || "None"}</div>
        <div>Quantity: {quantity}</div>
        <div>
          Base Price: $
          {(
            (selectedVariant?.pricing?.price?.gross?.amount || 99999) / 100
          ).toFixed(2)}
        </div>
        <div>Total Price: ${calculateTotalPrice().toFixed(2)}</div>
        {hasDiscount() && (
          <div>Discounted Total: ${calculateDiscountedPrice().toFixed(2)}</div>
        )}
        <div>Current in Cart: {currentItemQuantity}</div>
        <div>Total Cart Items: {totalItems}</div>
        <div className="mt-2">
          <strong>Selected Variant:</strong>
          <div className="ml-2">
            <div>Name: {selectedVariant?.name}</div>
            <div>SKU: {selectedVariant?.sku}</div>
            <div>
              Price:{" "}
              {selectedVariant?.pricing?.price?.gross?.amount
                ? `$${(
                    selectedVariant.pricing.price.gross.amount / 100
                  ).toFixed(2)}`
                : "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
