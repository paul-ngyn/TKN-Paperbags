"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './DesignPage.module.css';
import paperbag from '../../public/paperbagproduct.jpg';

interface DesignPageProps {
  handleNavigation?: (page: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DesignPage: React.FC<DesignPageProps> = ({ handleNavigation }) => {
  const [logo, setLogo] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file && file.type === 'image/png') {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target) {
            setLogo(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload a valid PNG file.');
      }
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
          <Image src={logo} alt="Uploaded Logo" className={styles.logoOverlay} />
        )}
      </div>

      <div className={styles.controls}>
        <label htmlFor="logoUpload" className={styles.uploadLabel}>
          Upload Your Logo:
        </label>
        <input type="file" id="logoUpload" accept="image/png" onChange={handleLogoUpload} />
      </div>

      <div className={styles.navigation}>
        <button onClick={() => setLogo(null)} className={styles.navButton}>Clear</button>
      </div>
    </div>
  );
};

export default DesignPage;