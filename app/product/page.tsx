"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import ProductPage from '../components/ProductPage/ProductPage';

const Product: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (page: string) => {
    router.push(`/${page}`);
  };

  return <ProductPage handleNavigation={handleNavigation} />;
};

export default Product;