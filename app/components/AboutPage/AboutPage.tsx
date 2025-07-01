"use client";

import React from "react";
import Image from "next/image";
import styles from "./AboutPage.module.css";
import tknLogo from "../../public/tkn_products.png";
import locationplaceholda from "../../public/locationplaceholder1.png";
import DroneVideo from "../DroneVideo/DroneVideo";

interface AboutPageProps {
  handleNavigation?: (page: string) => void;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AboutPage: React.FC<AboutPageProps> = ({ handleNavigation }) => {
  return (

    
    <div className={styles.container}>
      <h2 style={{ fontSize: '32px', fontWeight: "bold", marginBottom: '2%', textAlign: 'center' }}></h2>
      {/* MTC logo on the left, text on the right */}
      <div className={styles.section}>
        <div className={styles.logoTextRow}>
          <div className={`${styles.textContainer} `}>
          <h2 style={{ fontSize: '32px', fontWeight: "bold", marginBottom: '35px' }}> About Us</h2>
            <p>
            MTC was founded in 2006 in the heart of San Francisco, expanding our operations and facilities to Hayward, California in 2019.
            </p>
            <br />
            <p>
            Our goal is to provide the highest quality, eco-friendly, biodegradable, and compostable products seen in the world today.
            </p>
            <br />
            <p>
            With over 15+ years of experience in the distribution business, we take pride in our products and service and are honored to provide solutions for food service professionals across America. 
            </p>
          </div>
          <div className={styles.logoContainer}>
            <Image
              src={locationplaceholda}
              alt="MTC Logo"
              width={520}
              height={600}
            />
          </div>
        </div>
      </div>
      {/* logo on the right, text on the left */}
      <h2 style={{ fontSize: '32px',fontWeight: "bold", textAlign: 'center' }}>Our Brand</h2>
      <div className={styles.section}>
        <div className={styles.logoTextRow2}>
        <div className={styles.logoContainer2}>
            <Image
              src={tknLogo}
              alt="TKN Logo"
              width={250}
              height={250}
            />
          </div>
          <div className={`${styles.textContainer}`}>
          <h2 style={{ fontSize: '26px',fontWeight: "bold", marginBottom: '20px' }}>TKN Products</h2>
            <p>
              Our TKN branded products feature high quality materials ensuring durability and strength.
            </p>
            <br />
            <p>
              Our sustainably-sourced products are environmentally friendly, biodegradable, recyclable, compostable and made right here in the U.S.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;