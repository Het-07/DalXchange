"use client";

import { useRef, useEffect, useState } from "react";
import "./CategorySection.css";

const CategorySection = () => {
  const categories = [
    { name: "Textbooks", icon: "📚", color: "#e0efff" },
    { name: "Electronics", icon: "💻", color: "#d4f7d4" },
    { name: "Furniture", icon: "🪑", color: "#fff9d6" },
    { name: "Apparel", icon: "👕", color: "#f3e8ff" },
    { name: "Kitchen", icon: "🍽️", color: "#ffe3e3" },
    { name: "Sports", icon: "🏀", color: "#ffeacc" },
  ];

  // Duplicate categories to create a seamless loop effect
  const allCategories = [...categories, ...categories, ...categories];

  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollSpeed = 0.5;

  // Function to handle the automatic scrolling
  const autoScroll = () => {
    if (!carouselRef.current || isPaused) {
      animationRef.current = requestAnimationFrame(autoScroll);
      return;
    }

    const carousel = carouselRef.current;

    // If we've scrolled to near the end of the second set, reset to the first set
    if (carousel.scrollLeft >= (carousel.scrollWidth * 2) / 3) {
      carousel.style.scrollBehavior = "auto";
      carousel.scrollLeft = carousel.scrollWidth / 3 - carousel.clientWidth / 2;
      void carousel.offsetHeight;
      carousel.style.scrollBehavior = "smooth";
    }

    // Scroll a small amount to create continuous movement
    carousel.scrollLeft += scrollSpeed;

    // Continue the animation
    animationRef.current = requestAnimationFrame(autoScroll);
  };

  useEffect(() => {
    // Start the automatic scrolling
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(autoScroll);
    }

    // Initialize the carousel position to the first set of duplicated items
    if (carouselRef.current) {
      carouselRef.current.scrollLeft =
        carouselRef.current.scrollWidth / 3 -
        carouselRef.current.clientWidth / 2;
    }

    // Pause animation when tab is not visible to save resources
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Pause animation on hover
    const carousel = carouselRef.current;
    const pauseAnimation = () => setIsPaused(true);
    const resumeAnimation = () => setIsPaused(false);

    carousel?.addEventListener("mouseenter", pauseAnimation);
    carousel?.addEventListener("mouseleave", resumeAnimation);
    carousel?.addEventListener("touchstart", pauseAnimation);
    carousel?.addEventListener("touchend", resumeAnimation);

    // Clean up
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      carousel?.removeEventListener("mouseenter", pauseAnimation);
      carousel?.removeEventListener("mouseleave", resumeAnimation);
      carousel?.removeEventListener("touchstart", pauseAnimation);
      carousel?.removeEventListener("touchend", resumeAnimation);
    };
  }, []);

  return (
    <section className="category-section">
      <div className="category-container">
        <h2 className="category-heading">Categories</h2>

        <div className="carousel-container">
          <div className="category-carousel" ref={carouselRef}>
            {allCategories.map((category, index) => (
              <div
                key={`${category.name}-${index}`}
                className="category-card"
                style={{ backgroundColor: category.color }}
              >
                <div className="category-icon">{category.icon}</div>
                <h3 className="category-name">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
