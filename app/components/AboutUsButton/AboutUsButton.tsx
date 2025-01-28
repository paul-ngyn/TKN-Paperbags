"use client";
import React from 'react';
import styles from './AboutUsButton.module.css';

interface AboutUsButtonProps {
  onClick: () => void;
}

const AboutUsButton: React.FC<AboutUsButtonProps> = ({ onClick}) => {
  return (
    <button onClick={onClick} className={styles.navButton}>
      About Us
    </button>
  );
};

export default AboutUsButton;