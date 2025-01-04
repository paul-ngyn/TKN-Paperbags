"use client";
import React from 'react';
import styles from './ProductButton.module.css';

interface ProductButtonProps {
  setPage: (page: string) => void;
}

const ProductButton: React.FC<ProductButtonProps> = ({ setPage }) => {
  return (
    <button onClick={() => setPage('product')} className={styles.navButton}>
      Bags
    </button>
  );
};

export default ProductButton;