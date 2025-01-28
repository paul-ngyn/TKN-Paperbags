"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import InfoPage from '../components/InfoPage';

const OrderInfo: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (page: string) => {
    router.push(`/${page}`);
  };

  return <InfoPage handleNavigation={handleNavigation} />;
};

export default OrderInfo;