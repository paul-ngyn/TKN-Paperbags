"use client";

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import Image from 'next/image';

// Import the logo image
import mtcLogo from '../../public/MTC-logo.png';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.logoInfoWrapper}>
        <div className={styles.logoContainer}>
          <Image src={mtcLogo} alt="MTC Logo" width={150} height={150} />
        </div>
        <div className={styles.contactInfo}>
          <p>Address: 123 Maple Street, City, Country</p>
          <p>Phone: 777-777-7777</p>
          <p>Email: info@mapletradecorp.com</p>
        </div>
      </div>
      <div className={styles.linksContainer}>
        <Link href="/bags" className={styles.footerLink}>Bags</Link>
        <Link href="/about" className={styles.footerLink}>About Us</Link>
        <Link href="/contact" className={styles.footerLink}>Contact Us</Link>
        <Link href="/orderinfo" className={styles.footerLink}>Ordering Information</Link>
      </div>
      <p className={styles.footerText}>© 2025 Maple Trade Corporation. All rights reserved.</p>
    </footer>
  );
};

export default Footer;