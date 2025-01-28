"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import ProductPage from '../components/ProductPage';

const Product: React.FC = () => {
  const router = useRouter();

  const handleOpenQuoteForm = () => {
    // Implement quote form logic here if needed
  };

  const handleNavigation = (page: string) => {
    router.push(`/${page}`);
  };

  return <ProductPage handleOpenQuoteForm={handleOpenQuoteForm} handleNavigation={handleNavigation} />;
};

export default Product;