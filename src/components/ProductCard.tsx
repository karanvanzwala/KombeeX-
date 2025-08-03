"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { ADD_TO_CART_MUTATION } from "../../graphql/ADD_TO_CART_MUTATION";
import client from "../../lib/apollo-client";
import { useCartStore, useAuthStore } from "../stores/index";
import { useRouter } from "next/navigation";
import ProductCarousel from "./ProductCarousel";

interface ProductCardProps {
  product: any;
  showQuickView?: boolean;
  showAddToCart?: boolean;
  className?: string;
}

interface VariantWithImage {
  id: string;
  name: string;
  sku: string;
  image?: string;
  price?: number;
}

export default function ProductCard({
  product,
  showQuickView = true,
  showAddToCart = true,
  className = "",
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<any>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

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
          setAddSuccess(true);
          setTimeout(() => setAddSuccess(false), 2000); // Reset after 2 seconds
        } else if (
          data.checkoutCreate.errors &&
          data.checkoutCreate.errors.length > 0
        ) {
          console.error("GraphQL errors:", data.checkoutCreate.errors);
          setAddSuccess(false);
        }
      },
      onError: (error) => {
        console.error("Error adding to cart via GraphQL:", error);
        console.error(
          "Error details:",
          error.graphQLErrors,
          error.networkError
        );
        setAddSuccess(false);
      },
    }
  );

  // Create variants with images
  const createVariantsWithImages = (): VariantWithImage[] => {
    const variants: VariantWithImage[] = [];

    // Add main product image as first variant if no variants exist
    if (!product.variants || product.variants.length === 0) {
      const mainImage = product.media?.[0]?.url || "/default-product.svg";
      variants.push({
        id: product.id,
        name: product.name,
        sku: product.sku || "MAIN",
        image: mainImage,
        price: product.variants?.[0]?.pricing?.price?.gross?.amount
          ? product.variants[0].pricing.price.gross.amount / 100
          : 999.99,
      });
      return variants;
    }

    // Create variants with their specific images
    product.variants.forEach((variant: any, index: number) => {
      // Try to find variant-specific image
      let variantImage = variant.image?.url;

      // If no variant-specific image, use product media at same index
      if (!variantImage && product.media && product.media[index]) {
        variantImage = product.media[index].url;
      }

      // If still no image, use first product image
      if (!variantImage && product.media && product.media[0]) {
        variantImage = product.media[0].url;
      }

      // Fallback to default image
      if (!variantImage) {
        variantImage = "/default-product.svg";
      }

      variants.push({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        image: variantImage,
        price: variant.pricing?.price?.gross?.amount
          ? variant.pricing.price.gross.amount / 100
          : 999.99,
      });
    });

    return variants;
  };

  const variantsWithImages = createVariantsWithImages();

  // Create carousel items from product images
  const createCarouselItems = () => {
    const items: Array<{
      id: number;
      image: string;
      title: string;
      alt?: string;
    }> = [];

    // Add all product media images
    if (product.media && product.media.length > 0) {
      product.media.forEach((media: any, index: number) => {
        if (media.url) {
          items.push({
            id: index,
            image: media.url,
            title: product.name,
            alt: `${product.name} - Image ${index + 1}`,
          });
        }
      });
    }

    // Add variant images if they're different from media
    variantsWithImages.forEach((variant, index) => {
      const existingImage = items.find((item) => item.image === variant.image);
      if (!existingImage && variant.image) {
        items.push({
          id: product.media?.length + index,
          image: variant.image,
          title: variant.name,
          alt: `${variant.name} - ${product.name}`,
        });
      }
    });

    // If no images, add default
    if (items.length === 0) {
      items.push({
        id: 0,
        image: "/default-product.svg",
        title: product.name,
        alt: product.name,
      });
    }

    return items;
  };

  const carouselItems = createCarouselItems();

  // Set initial variant
  useEffect(() => {
    if (variantsWithImages.length > 0) {
      setCurrentVariant(variantsWithImages[0]);
    }
  }, []);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart) return; // Prevent multiple clicks

    setIsAddingToCart(true);
    console.log("Adding to cart:", product.name);

    const cartItem = {
      id: currentVariant?.id || product.id,
      name: product.name,
      price: currentVariant?.price || 999.99,
      quantity: 1,
      image:
        currentVariant?.image ||
        product.media?.[0]?.url ||
        "/default-product.svg",
      variant: currentVariant
        ? {
            id: currentVariant.id,
            name: currentVariant.name,
            sku: currentVariant.sku,
          }
        : undefined,
    };

    try {
      if (!isAuthenticated) {
        // Add to localStorage cart for non-authenticated users
        addItemToLocalStorage(cartItem);
        console.log("Item added to localStorage cart");
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 2000);
      } else {
        // Add to main cart store for authenticated users
        addItem(cartItem);

        // Try to add to server cart via GraphQL
        if (currentVariant) {
          await addToCartMutation({
            variables: {
              input: {
                lines: [
                  {
                    quantity: 1,
                    variantId: currentVariant.id,
                  },
                ],
              },
            },
          });
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddSuccess(false);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: any) => {
    if (!price) return "$999.99";
    return `$${price.toFixed(2)}`;
  };

  const itemQuantity = getItemQuantity(currentVariant?.id || product.id);
  const isInCart = itemQuantity > 0;

  // Get button text based on state
  const getButtonText = () => {
    if (isAddingToCart || cartLoading) return "Adding...";
    if (addSuccess) return "Added!";
    if (isInCart) return `In Cart (${itemQuantity})`;
    return "Add to Cart";
  };

  // Get button styling based on state
  const getButtonStyle = () => {
    if (isAddingToCart || cartLoading) {
      return "bg-gray-400 text-white cursor-not-allowed";
    }
    if (addSuccess) {
      return "bg-green-600 text-white hover:bg-green-700";
    }
    if (isInCart) {
      return "bg-blue-700 text-white hover:bg-blue-800";
    }
    return "bg-blue-600 text-white hover:bg-blue-700";
  };

  // const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // const [currentVariant, setCurrentVariant] = useState(product.variants[0]);

  // const carouselItems = product.images || [];
  // const variantsWithImages = product.variants || [];

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };
  return (
    // <div
    //   className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-slate-200 hover:border-slate-300 relative ${className}`}
    //   onMouseEnter={() => setIsHovered(true)}
    //   onMouseLeave={() => setIsHovered(false)}
    // >
    //   {/* Image Container with Carousel */}
    //   <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
    //     <ProductCarousel
    //       items={carouselItems}
    //       autoplay={isHovered}
    //       autoplayDelay={4000}
    //       pauseOnHover={true}
    //       loop={true}
    //       showIndicators={carouselItems.length > 1}
    //       className="w-full h-full"
    //     />

    //     {/* Badges */}
    //     <div className="absolute top-3 left-3 flex flex-col space-y-2 z-10">
    //       {/* Cart Badge */}
    //       {isInCart && (
    //         <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
    //           {itemQuantity} in cart
    //         </div>
    //       )}

    //       {/* Success Badge */}
    //       {addSuccess && (
    //         <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm animate-pulse">
    //           Added!
    //         </div>
    //       )}

    //       {/* Variant Count Badge */}
    //       {variantsWithImages.length > 1 && (
    //         <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
    //           {variantsWithImages.length} variants
    //         </div>
    //       )}
    //     </div>

    //     {/* Image Count Badge */}
    //     {carouselItems.length > 1 && (
    //       <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm z-10">
    //         +{carouselItems.length - 1}
    //       </div>
    //     )}
    //   </div>

    //   {/* Product Info */}
    //   <div className="p-6">
    //     {/* Category */}
    //     {product.category && (
    //       <div className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wide">
    //         {product.category.name}
    //       </div>
    //     )}

    //     {/* Product Title */}
    //     <Link href={`/products/${product.slug || product.id}`}>
    //       <h3 className="font-semibold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer">
    //         {product.name}
    //       </h3>
    //     </Link>

    //     {/* Current Variant Info */}
    //     {currentVariant && (
    //       <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
    //         <div className="flex items-center justify-between">
    //           <div>
    //             <p className="text-sm font-medium text-blue-900">
    //               {currentVariant.name}
    //             </p>
    //             <p className="text-xs text-blue-600">
    //               SKU: {currentVariant.sku}
    //             </p>
    //           </div>
    //           <span className="text-lg font-bold text-blue-900">
    //             {formatPrice(currentVariant.price)}
    //           </span>
    //         </div>
    //       </div>
    //     )}

    //     {/* Price */}
    //     <div className="flex items-center justify-between mb-4">
    //       <div className="flex items-center space-x-2">
    //         <span className="text-xl font-bold text-gray-900">
    //           {formatPrice(currentVariant?.price)}
    //         </span>
    //         {currentVariant?.price !==
    //           product.variants?.[0]?.pricing?.priceUndiscounted?.gross
    //             ?.amount && (
    //           <span className="text-sm text-gray-500 line-through">
    //             {formatPrice(
    //               product.variants?.[0]?.pricing?.priceUndiscounted?.gross
    //                 ?.amount / 100
    //             )}
    //           </span>
    //         )}
    //       </div>

    //       {/* Wishlist Button */}
    //       <button className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200">
    //         <svg
    //           className="w-5 h-5"
    //           fill="none"
    //           stroke="currentColor"
    //           viewBox="0 0 24 24"
    //         >
    //           <path
    //             strokeLinecap="round"
    //             strokeLinejoin="round"
    //             strokeWidth={2}
    //             d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    //           />
    //         </svg>
    //       </button>
    //     </div>

    //     {/* Variants Preview */}
    //     {variantsWithImages.length > 1 && (
    //       <div className="space-y-2 mb-4">
    //         <div className="flex items-center justify-between text-sm">
    //           <span className="text-gray-500">Available Variants</span>
    //           <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
    //             {variantsWithImages.length} options
    //           </span>
    //         </div>

    //         <div className="grid grid-cols-2 gap-2">
    //           {variantsWithImages.slice(0, 4).map((variant, index) => (
    //             <button
    //               key={variant.id}
    //               onClick={() => setCurrentVariant(variant)}
    //               className={`p-2 rounded-lg border transition-all duration-200 text-left ${
    //                 currentVariant?.id === variant.id
    //                   ? "border-blue-500 bg-blue-50"
    //                   : "border-gray-200 hover:border-gray-300"
    //               }`}
    //             >
    //               <div className="flex items-center space-x-2">
    //                 <img
    //                   src={variant.image}
    //                   alt={variant.name}
    //                   className="w-6 h-6 object-cover rounded"
    //                 />
    //                 <div className="flex-1 min-w-0">
    //                   <p className="text-xs font-medium text-gray-900 truncate">
    //                     {variant.name}
    //                   </p>
    //                   <p className="text-xs text-gray-500">
    //                     {formatPrice(variant.price)}
    //                   </p>
    //                 </div>
    //               </div>
    //             </button>
    //           ))}
    //           {variantsWithImages.length > 4 && (
    //             <div className="col-span-2 text-center">
    //               <button className="text-xs text-blue-600 font-medium hover:text-blue-800">
    //                 +{variantsWithImages.length - 4} more variants
    //               </button>
    //             </div>
    //           )}
    //         </div>
    //       </div>
    //     )}

    //   </div>
    // </div>
    <>
      {/* FULL CARD LINK */}
      <Link
        href={`/products/${product.slug || product.id}`}
        className={`group block rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-300 bg-white overflow-hidden relative ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <ProductCarousel
            items={carouselItems}
            autoplay={isHovered}
            autoplayDelay={4000}
            pauseOnHover={true}
            loop={true}
            showIndicators={carouselItems.length > 1}
            className="w-full h-full object-cover"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 space-y-2 z-10">
            {product.itemQuantity > 0 && (
              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow backdrop-blur-sm">
                {product.itemQuantity} in cart
              </span>
            )}
            {product.addSuccess && (
              <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full animate-pulse backdrop-blur-sm shadow">
                Added!
              </span>
            )}
            {variantsWithImages.length > 1 && (
              <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm shadow">
                {variantsWithImages.length} variants
              </span>
            )}
          </div>
          {carouselItems.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-md z-10">
              +{carouselItems.length - 1}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 md:p-6">
          {product.category && (
            <p className="text-xs font-semibold  text-blue-600 uppercase mb-2 tracking-wide truncate">
              {product.category.name}
            </p>
          )}

          <h3 className="text-lg font-semibold uppercase  tracking-wide truncate text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-3 line-clamp-2">
            {product.name}
          </h3>

          {currentVariant && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {currentVariant.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    SKU: {currentVariant.sku}
                  </p>
                </div>
              </div>
              {/* <span className="text-lg font-bold text-blue-900">
                {formatPrice(currentVariant.price)}
              </span> */}
            </div>
          )}

          {/* Price and +More Variants */}
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(currentVariant?.price)}
            </span>
            {variantsWithImages.length > 4 && (
              <button
                className="text-xs text-blue-600 font-medium hover:text-blue-800 underline"
                onClick={openModal}
              >
                +{variantsWithImages.length - 4} more variants
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2">
            {showAddToCart && (
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || cartLoading}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${getButtonStyle()}`}
              >
                {getButtonText()}
              </button>
            )}
          </div>
        </div>
      </Link>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-lg text-black font-bold mb-4">More Variants</h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {variantsWithImages.slice(4).map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center gap-3 p-2 border rounded-lg hover:border-blue-500 transition-all"
                >
                  <img
                    src={variant.image}
                    alt={variant.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-black font-medium">
                      {variant.name}
                    </p>
                    <p className="text-xs text-black">
                      {formatPrice(variant.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
