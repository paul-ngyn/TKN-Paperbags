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
      {/* Section 1: MTC logo on the left, text on the right */}
      <div className={styles.section}>
        <div className={styles.logoTextRow}>
          <div className={styles.logoContainer}>
            <Image
              src={mtcLogo}
              alt="MTC Logo"
              width={150}
              height={150}
              className={styles.fadeIn}
            />
          </div>
          <div className={styles.textContainer}>
            <h2>MTC - About Us</h2>
            <p>
              Learn about Maple Trade Corporation’s commitment to quality,
              sustainability, and innovative solutions delivered with integrity.
            </p>
          </div>
        </div>
      </div>
      {/* Section 2: TKN logo on the right, text on the left */}
      <div className={styles.section}>
        <div className={styles.logoTextRowReverse}>
          <div className={styles.textContainer}>
            <h2>TKN - About Us</h2>
            <p>
              Discover our TKN products and how our expertise ensures seamless integration
              of cutting‑edge designs with practicality.
            </p>
          </div>
          <div className={styles.logoContainer}>
            <Image
              src={tknLogo}
              alt="TKN Logo"
              width={150}
              height={150}
              className={styles.fadeIn}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;