"use client";

import React from 'react';
import ProductPage from '../components/ProductPage';

const Product: React.FC = () => {
  const handleOpenQuoteForm = () => {
    // Implement quote form logic here if needed
  };

  const handleNavigation = (page: string) => {
    // Implement navigation logic here if needed
  };

  return <ProductPage handleOpenQuoteForm={handleOpenQuoteForm} handleNavigation={handleNavigation} />;
};

export default Product;