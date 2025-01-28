"use client";

import React from 'react';

interface ContactPageProps {
  handleNavigation?: (page: string) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ handleNavigation }) => {
  return (
    <div>
      <h1>Contact Us Page</h1>
      {handleNavigation && (
        <button onClick={() => handleNavigation('about')}>Go to About Page</button>
      )}
    </div>
  );
};

export default ContactPage;