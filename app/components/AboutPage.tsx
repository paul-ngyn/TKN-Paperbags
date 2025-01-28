"use client";

import React from 'react';

interface AboutPageProps {
  handleNavigation?: (page: string) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ handleNavigation }) => {
  return (
    <div>
      <h1>About Us Page</h1>
      {handleNavigation && (
        <button onClick={() => handleNavigation('about')}>Go to Contact Page</button>
      )}
    </div>
  );
};

export default AboutPage;