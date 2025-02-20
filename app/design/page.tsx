"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import DesignPage from '../components/DesignPage/DesignPage';

const Design: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (page: string) => {
    router.push(`/${page}`);
  };

  return <DesignPage handleNavigation={handleNavigation} />;
};

export default Design;