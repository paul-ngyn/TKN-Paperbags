"use client";
import React from 'react';
import styles from './OrderInfoButton.module.css';

interface OrderInfoButtonProps {
  setPage: (page: string) => void;
}

const OrderInfoButton: React.FC<OrderInfoButtonProps> = ({ setPage }) => {
  return (
    <button onClick={() => setPage('orderinfo')} className={styles.navButton}>
      Ordering Information
    </button>
  );
};

export default OrderInfoButton;