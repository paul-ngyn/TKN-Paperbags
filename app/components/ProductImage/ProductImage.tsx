"use client"

import React from "react"
import styles from "./ProductImage.module.css"
import Image from "next/image"

import paperbagproduct from "../../public/paperbagproduct.jpg";

const ProductImage: React.FC = () => {
  return (
    <div className={styles.productImageContainer}>
      <Image
        src={paperbagproduct}
        alt="Paper Bag Product"
        width={520} // Adjust the width as needed
        height={520} // Adjust the height as needed
        className={styles.productImage}
      />
    </div>
  );
};

export default ProductImage;