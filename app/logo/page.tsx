"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import LogoPage from '../components/LogoPage';

const Logo: React.FC = () => {
  const router = useRouter();
  const handleNavigation = (page:string) => {
    router.push(`/${page}`);
  };

  return <LogoPage handleNavigation={handleNavigation} />;
};

export default Logo;