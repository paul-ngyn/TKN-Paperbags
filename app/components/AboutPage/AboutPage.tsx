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
          <h2 style={{ fontWeight: "bold" }}>MAPLE TRADE CORPORATION (MTC)</h2>
            <p>
            MTC was founded in 2006 in the heart of San Francisco and in 2019 we expanded our operations and facilities to Hayward, CA.
            <br />
            Our goal is to provide the highest quality of eco-friendly, biodegradable, and compostable products seen in the world today.
            <br />
            With more than 10+ years of experience in the plastic container business, we take pride in our products and service and are honored to provide solutions for food service professionals across North America. 
            </p>
          </div>
        </div>
      </div>
      {/* logo on the right, text on the left */}
      <div className={styles.section}>
        <div className={styles.logoTextRow}>
          <div className={`${styles.textContainer} ${styles.fadeIn}`}>
          <h2 style={{ fontWeight: "bold" }}>TKN - OUR BRAND</h2>
            <p>
              Discover our TKN products and how our expertise ensures seamless integration
              of cutting‑edge designs with practicality.
            </p>
          </div>
          <div className={styles.logoContainer}>
            <Image
              src={tknLogo}
              alt="TKN Logo"
              width={200}
              height={200}
              className={styles.fadeIn}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;