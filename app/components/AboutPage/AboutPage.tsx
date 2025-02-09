"use client";

import React from "react";
import Image from "next/image";
import styles from "./AboutPage.module.css";
import mtcLogo from "../../public/MTC-logo.png";
import tknLogo from "../../public/tkn_products.png";

interface AboutPageProps {
  handleNavigation?: (page: string) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ handleNavigation }) => {
  return (
    <div className={styles.container}>
      {/* MTC logo on the left, text on the right */}
      <div className={styles.section}>
        <div className={styles.logoTextRow}>
          <div className={styles.logoContainer}>
            <Image
              src={mtcLogo}
              alt="MTC Logo"
              width={200}
              height={200}
              className={styles.fadeIn}
            />
          </div>
          <div className={`${styles.textContainer} ${styles.fadeIn}`}>
          <h2 style={{ fontWeight: "bold", marginBottom: '20px' }}>MAPLE TRADE CORPORATION (MTC)</h2>
            <p>
            MTC was founded in 2006 in the heart of San Francisco,expanding our operations and facilities to Hayward, CA in 2019.
            </p>
            <br />
            <p>
            Our goal is to provide the highest quality, eco-friendly, biodegradable, and compostable products seen in the world today.
            </p>
            <br />
            <p>
            With more than 10+ years of experience in distribution, we take pride in our products and service and are honored to provide solutions for food service professionals across North America. 
            </p>
          </div>
        </div>
      </div>
      {/* logo on the right, text on the left */}
      <div className={styles.section}>
        <div className={styles.logoTextRow}>
          <div className={`${styles.textContainer} ${styles.fadeIn}`}>
          <h2 style={{ fontWeight: "bold", marginBottom: '20px' }}>TKN PRODUCTS - OUR BRAND</h2>
            <p>
              Our TKN branded products feature high quality materials ensuring durability and strength.
            </p>
            <br />
            <p>
              Our products are environmentally friendly, biodegradable, recyclable and compostable.
            </p>
          </div>
          <div className={styles.logoContainer}>
            <Image
              src={tknLogo}
              alt="TKN Logo"
              width={220}
              height={220}
              className={styles.fadeIn}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;