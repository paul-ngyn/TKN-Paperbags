"use client";

import React, { useState } from "react";
import Image, { StaticImageData } from "next/image";
import styles from "./ProductImageCarousel.module.css";

interface ProductImageCarouselProps {
  images: StaticImageData[];
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleSelectImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.previewContainer}>
        {images.map((img, index) => (
          <div
            key={index}
            className={`${styles.previewItem} ${currentIndex === index ? styles.activePreview : ""}`}
            onClick={() => handleSelectImage(index)}
          >
            <Image
              src={img}
              alt={`Preview ${index + 1}`}
              width={80}
              height={80}   
              className={styles.previewImage}
            />
          </div>
        ))}
      </div>
      <div className={styles.mainImageContainer}>
        <button onClick={handlePrev} className={styles.arrowButton} aria-label="Previous">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="#1c51a3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <div className={styles.imageContainer}>
          <Image
            src={images[currentIndex]}
            alt={`Product image ${currentIndex + 1}`}
            width={800}
            height={1000}
            className={styles.productImage}
          />
        </div>
        <button onClick={handleNext} className={styles.arrowButton} aria-label="Next">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="#1c51a3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductImageCarousel;