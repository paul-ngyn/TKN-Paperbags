"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './DesignPage.module.css';
import paperbag from '../../public/paperbagproduct.jpg';

interface DesignPageProps {
  handleNavigation?: (page: string) => void;
}

const DesignPage: React.FC<DesignPageProps> = ({ handleNavigation }) => {
  const [logo, setLogo] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navLink}>Home</Link>
        <Link href="/product" className={styles.navLink}>Product</Link>
        <Link href="/design" className={styles.navLink}>Customize</Link>
      </nav>

      <h1 className={styles.heading}>Customize Your Bag</h1>

      <div className={styles.bagContainer}>
        <Image
          src={paperbag}
          alt="Customizable Paper Bag"
          className={styles.bagImage}
          layout="fill"
          objectFit="cover"
        />
        {logo && (
          <img src={logo} alt="Uploaded Logo" className={styles.logoOverlay} />
        )}
      </div>

      <div className={styles.controls}>
        <label htmlFor="logoUpload" className={styles.uploadLabel}>
          Upload Your Logo:
        </label>
        <input type="file" id="logoUpload" accept="image/*" onChange={handleLogoUpload} />
      </div>

      <div className={styles.navigation}>
        <Link href="/" className={styles.navButton}>Home</Link>
        <Link href="/product" className={styles.navButton}>Back to Product</Link>
      </div>
    </div>
  );
};

export default DesignPage;