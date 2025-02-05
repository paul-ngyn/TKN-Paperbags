"use client";

import React from 'react';
import styles from './InfoPage.module.css';

interface InfoPageProps {
  handleNavigation?: (page: string) => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ handleNavigation }) => {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2>Image Upload Details</h2>
        <p>
          Here you can find the details on how to upload images for your orders. Make sure your images meet the required specifications for the best results.
        </p>
      </div>
      <div className={styles.section}>
        <h2>Order Process</h2>
        <p>
          Learn about our order process, from placing an order to delivery. We ensure a smooth and efficient process to meet your needs promptly.
        </p>
      </div>
    </div>
  );
};

export default InfoPage;