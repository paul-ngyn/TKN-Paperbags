"use client";

import React from "react";
import Image from "next/image";
import styles from "./InfoPage.module.css";
import placeholder from "../../public/two-bag-christmas-transp.png";
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
          <h2>Bag Customization and Image Upload Details</h2>
          <p>
            When uploading an image for customization, please ensure that the image meets the allowed formats of .png, .jpg, or .jpeg. 
          </p>
          <br />
          <p>
            Images must also meet a minimum resolution of 100x100 and a maximum size of 10MB per image. All blueprints produced will be downloaded in a .pdf format and can easily be uploaded in your quote.
          </p>
          <br />
            <p>
            Please note that utilizing white ink on your design may result in adjustments to the price and minimum order quantity.
          </p>
        </div>
        <div className={styles.imageContainer}>
          <Image
            src={placeholder}
            alt="Placeholder"
            width={520}
            height={520}
          />
        </div>
      </div>

      {/* Section 2: Image on the left, text on the right */}
      <div className={`${styles.sectionunder} ${styles.rowreverse}`}>
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
            Our order process all starts with you requesting a quote! After a quote is received with all details and customization we will contact you directly with the information provided. 
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