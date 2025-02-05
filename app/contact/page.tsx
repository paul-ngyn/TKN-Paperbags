"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import ContactPage from '../components/ContactUsPage/ContactUsPage';

const Contact: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (page: string) => {
    router.push(`/${page}`);
  };

  return <ContactPage handleNavigation={handleNavigation} />;
};

export default Contact;