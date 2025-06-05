"use client";

import React from 'react';
import Link from 'next/link';
import styles from './ImageSubHeader.module.css';

interface ImageSubHeaderProps {
  text: string;
  setPage: (page: string) => void;
}

const ImageSubHeader: React.FC<ImageSubHeaderProps> = ({ setPage }) => {
  return (
    <div className={styles.subHeader}>
      <div className={styles.overlayText}>
        CUSTOM PAPER BAGS AT AFFORDABLE PRICES.<br /> INSTANTLY DESIGNED BY YOU.
      </div>
      <Link href="/design" className={styles.designButton}>
        START DESIGNING NOW
      </Link>
    </div>
  );
};

export default ImageSubHeader;