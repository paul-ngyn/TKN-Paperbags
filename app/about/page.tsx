"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import AboutPage from '../components/AboutPage';

const About: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (page: string) => {
    router.push(`/${page}`);
  };

  return <AboutPage handleNavigation={handleNavigation} />;
};

export default About;