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
        <p>
          <a
            href="https://www.google.com/maps/place/Maple+Trade+Corporation/@37.6508929,-122.1439502,17z/data=!4m6!3m5!1s0x808f7f163c7d2c37:0xd5adc61a49cb242e!8m2!3d37.6508929!4d-122.1417615!16s%2Fg%2F1tcyxnl_?entry=ttu&g_ep=EgoyMDI1MDIwNS4xIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
          >
      Address: 2660 W Winton Ave, Hayward, CA 94545
         </a>
      </p>
          <p>Phone: 777-777-7777</p>
          <p>Email: admin@mapletradecorp.com</p>
        </div>
      </div>
      <div className={styles.linksContainer}>
        <Link href="/product" className={styles.footerLink}>Bags</Link>
        <Link href="/about" className={styles.footerLink}>About Us</Link>
        <Link href="/contact" className={styles.footerLink}>Contact Us</Link>
        <Link href="/orderinfo" className={styles.footerLink}>Ordering Information</Link>
      </div>
      <div className={styles.footerTextContainer}>
        <p className={styles.footerText}>© 2025 Maple Trade Corporation. All rights reserved.</p>
        <p className={styles.iconCredit}>
          <a target="_blank" href="https://icons8.com/icon/41fUjXXm7338/download">Download</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;