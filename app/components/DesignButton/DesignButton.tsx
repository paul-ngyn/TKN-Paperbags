"use client";
import React from 'react';
import styles from './DesignButton.module.css';

interface DesignButtonProps {
  onClick: (page: string) => void;
}

const DesignButton: React.FC<DesignButtonProps> = ({  onClick }) => {
  return (
    <button onClick={() =>  onClick('orderinfo')} className={styles.navButton}>
      Design
    </button>
  );
};

export default DesignButton;