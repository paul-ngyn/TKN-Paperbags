"use client";
import React from 'react';
import styles from './QuoteReqButton.module.css';

interface QuoteReqButtonProps {
  setPage: (page: string) => void;
}

const QuoteReqButton: React.FC<QuoteReqButtonProps> = ({ setPage }) => {

  return (
    <button onClick={() => setPage('quote')} className={styles.navButton}>
      Get A Quote
    </button>
  );
};

export default QuoteReqButton;