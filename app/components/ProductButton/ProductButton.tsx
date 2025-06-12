"use client";
import React from 'react';
import styles from './ProductButton.module.css';

interface ProductButtonProps {
  onClick: (page: string) => void;
}

const ProductButton: React.FC<ProductButtonProps> = ({ onClick }) => {
  return (
    <button onClick={() => onClick('product')} className={styles.navButton}>
      Our Bags
    </button>
  );
};

export default ProductButton;