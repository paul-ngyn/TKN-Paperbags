"use client";

import React from 'react';
import LogoPage from '../components/LogoPage';
const Logo: React.FC = () => {
  const handleNavigation = (page: string) => {
    // Implement navigation logic here if needed
  };

  return <LogoPage handleNavigation={handleNavigation} />;
};

export default Logo;