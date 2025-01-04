"use client";

import React from 'react';
import styles from './ImageSubHeader.module.css';

interface ImageSubHeaderProps {
  text: string;
}

const ImageSubHeader: React.FC<ImageSubHeaderProps> = ({ text }) => {
  return (
    <div className={styles.subHeader}>
      <div className={styles.overlayText}>CUSTOM PAPER BAGS AT WHOLESALE PRICES. <br /> INSTANTLY DESIGNED BY YOU.</div>
      <button className={styles.designButton}>DESIGN NOW</button>
    </div>
  );
};

export default ImageSubHeader;