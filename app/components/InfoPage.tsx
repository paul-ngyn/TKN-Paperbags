"use client";

import React from 'react';

interface InfoPageProps {
  handleNavigation?: (page: string) => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ handleNavigation }) => {
  return (
    <div>
      <h1>Order Information Page</h1>
      {handleNavigation && (
        <button onClick={() => handleNavigation('orderinfo')}>Go to Contact Page</button>
      )}
    </div>
  );
};

export default InfoPage;