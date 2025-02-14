"use client";

import React from "react";
import Image from "next/image";
import styles from "./InfoPage.module.css";
import placeholder from "../../public/placeholder.png";
import servicepic from "../../public/mtc_history-1.jpg"

interface InfoPageProps {
  handleNavigation?: (page: string) => void;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const InfoPage: React.FC<InfoPageProps> = ({ handleNavigation }) => {
  return (
    <div className={styles.container}>
      {/* Section 1: Text on the left, image on the right make sure to put burma bag or other custom here*/}
      <div className={`${styles.section} ${styles.row}`}>
        <div className={styles.textContainer}>
          <h2>Image Upload Details</h2>
          <p>
            Here you can find the details on how to upload images for your orders.
            Make sure your images meet the required specifications for the best results.
          </p>
        </div>
        <div className={styles.imageContainer}>
          <Image
            src={placeholder}
            alt="Placeholder"
            width={300}
            height={300}
          />
        </div>
      </div>

      {/* Section 2: Image on the left, text on the right */}
      <div className={`${styles.section} ${styles.rowreverse}`}>
        <div className={styles.imageContainer}>
          <Image
            src={servicepic}
            alt="Service"
            width={450}
            height={450}
          />
        </div>
        <div className={styles.textContainer}>
          <h2>Order Process</h2>
          <p>
            Our order process all starts with you requesting a quote! After a quote is received with all the necessary details including customization, we will contact you directly with the contact information provided. 
          </p>
          <br />
          <p>
            Once the quote is approved by both parties, design and production will begin. We will keep you updated on the progress of your order and provide tracking information once your order is shipped.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;