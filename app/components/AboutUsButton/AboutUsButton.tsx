"use client";
import React from 'react';
import styles from './AboutUsButton.module.css';

interface AboutUsButtonProps {
  setPage: (page: string) => void;
}

const AboutUsButton: React.FC<AboutUsButtonProps> = ({ setPage }) => {
  return (
    <button onClick={() => setPage('about')} className={styles.navButton}>
      About Us
    </button>
  );
};

export default AboutUsButton;