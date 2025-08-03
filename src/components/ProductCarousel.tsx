import { useEffect, useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
  Transition,
} from "framer-motion";

interface ProductCarouselItem {
  id: number;
  image: string;
  title: string;
  alt?: string;
}

interface ProductCarouselProps {
  items: ProductCarouselItem[];
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  showIndicators?: boolean;
  className?: string;
}

const DRAG_BUFFER = 50;
const VELOCITY_THRESHOLD = 500;
const SPRING_OPTIONS: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export default function ProductCarousel({
  items,
  autoplay = false,
  autoplayDelay = 4000,
  pauseOnHover = true,
  loop = true,
  showIndicators = true,
  className = "",
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const carouselItems = loop ? [...items, items[0]] : items;

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    loop,
    items.length,
    carouselItems.length,
    pauseOnHover,
  ]);

  const effectiveTransition: Transition = isResetting
    ? { duration: 0 }
    : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -(carouselItems.length - 1) * 100,
          right: 0,
        },
      };

  if (items.length === 0) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src="/default-product.svg"
            alt="Default Product"
            className="w-16 h-16 object-cover rounded-lg"
          />
        </div>
      </div>
    );
  }

  if (items.length === 1) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <img
          src={items[0].image}
          alt={items[0].alt || items[0].title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden rounded-lg ${className}`}
    >
      <motion.div
        className="flex h-full"
        drag="x"
        {...dragProps}
        style={{
          x,
          width: `${carouselItems.length * 100}%`,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * (100 / carouselItems.length)) + "%" }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const range = [
            -(index + 1) * (100 / carouselItems.length),
            -index * (100 / carouselItems.length),
            -(index - 1) * (100 / carouselItems.length),
          ];
          const outputRange = [90, 0, -90];
          const rotateY = useTransform(x, range, outputRange, { clamp: false });

          return (
            <motion.div
              key={index}
              className="relative flex-shrink-0 h-full"
              style={{
                width: `${100 / carouselItems.length}%`,
                rotateY: rotateY,
              }}
              transition={effectiveTransition}
            >
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.alt || item.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {showIndicators && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-1 px-2 py-1 bg-black/50 rounded-full backdrop-blur-sm">
            {items.map((_, index) => (
              <motion.button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentIndex % items.length === index
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                animate={{
                  scale: currentIndex % items.length === index ? 1.2 : 1,
                }}
                onClick={() => setCurrentIndex(index)}
                transition={{ duration: 0.15 }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
