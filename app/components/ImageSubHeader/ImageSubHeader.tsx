"use client";

import React from 'react';
import styles from './ImageSubHeader.module.css';

interface ImageSubHeaderProps {
  text: string;
  setPage: (page: string) => void;
}

const ImageSubHeader: React.FC<ImageSubHeaderProps> = ({ setPage }) => {
  return (
    <div className={styles.subHeader}>
      <div className={styles.overlayText}>
        CUSTOM PAPER BAGS AT WHOLESALE PRICES.<br /> INSTANTLY DESIGNED BY YOU.
      </div>
      <button className={styles.designButton} onClick={() => setPage('quote')}>
        GET A QUOTE NOW
      </button>
    </div>
  );
};

export default ImageSubHeader;