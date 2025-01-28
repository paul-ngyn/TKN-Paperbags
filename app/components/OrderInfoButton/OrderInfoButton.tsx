"use client";
import React from 'react';
import styles from './OrderInfoButton.module.css';

interface OrderInfoButtonProps {
  onClick: (page: string) => void;
}

const OrderInfoButton: React.FC<OrderInfoButtonProps> = ({  onClick }) => {
  return (
    <button onClick={() =>  onClick('orderinfo')} className={styles.navButton}>
      Ordering Information
    </button>
  );
};

export default OrderInfoButton;