"use client";

import React from 'react';
import styles from './Footer.module.css';
import Image from 'next/image';

// Import the logo image
import mtcLogo from '../../public/MTC-logo.png';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.logoContainer}>
        <Image src={mtcLogo} alt="MTC Logo" width={150} height={150} />
      </div>
      <p className={styles.footerText}>© 2025 Maple Trade Corporation. All rights reserved.</p>
    </footer>
  );
};

export default Footer;