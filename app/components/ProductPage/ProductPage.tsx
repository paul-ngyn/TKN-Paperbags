"use client";

import React, {useState} from 'react';
import Image from 'next/image';
import ProductImage from '../ProductImage/ProductImage';
import recyclelogo from '../../public/recyclelogo.png';
import tknlogo from '../../public/tkn_products.png';
import quoteicon from '../../public/quoteicon.png';
import customerserviceicon from '../../public/customerservice.png';
import packicon from '../../public/pack.png';
import shipicon from '../../public/shippingtruck.png';
import styles from './ProductPage.module.css';
import QuoteForm from '../QuoteForm/QuoteForm';

interface ProductPageProps {
  handleNavigation: (page: string) => void;
}


const ProductPage: React.FC<ProductPageProps> = ({ handleNavigation }) => {
  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <ProductImage />
      <div className="productDetailsContainer">
        <h2 className="productName">Paper Bag</h2>
        <div className="logoContainer">
          <Image src={recyclelogo} alt="Recycle Logo" width={40} height={20} />
          <Image src={tknlogo} alt="TKN Products Logo" width={40} height={30} />
        </div>
        <div className="productOptions">
          <label htmlFor="productOptions">Choose an option:</label>
          <select id="productOptions" name="productOptions">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <p className="productDescription">
          Our paper bags are made from the highest quality materials, ensuring durability and strength.
        </p>
        <div className="buttonContainer">
          <button className="product-button" onClick={handleOpenModal}>Request a Quote</button>
          <a href="/orderinfo" className="product-button-link">
            Image Upload Details
          </a>
        </div>
        <div className="processlogoContainer">
          <div className={styles.logoWithDescription}>
            <Image className = {styles.logoImage} src={quoteicon} alt="Quote Logo" width={50} height={35} />
            <p className={styles.logoDescription}>QUOTE REQUESTED</p>
          </div>
          <div className="divider"></div>
          <div className={styles.logoWithDescription}>
            <Image className = {styles.logoImage} src={customerserviceicon} alt="Service Logo" width={55} height={30} />
            <p className={styles.logoDescription}>CONFIRM YOUR ORDER</p>
          </div>
          <div className="divider"></div>
          <div className={styles.logoWithDescription}>
            <Image className = {styles.logoImage} src={packicon} alt="Pack Logo" width={55} height={30} />
            <p className={styles.logoDescription}>CUSTOMIZED & PACKED</p>
          </div>
          <div className="divider"></div>
          <div className={styles.logoWithDescription}>
            <Image className = {styles.logoImage} src={shipicon} alt="Ship Logo" width={60} height={30} />
            <p className={styles.logoDescription}>DELIVERED TO YOU</p>
          </div>
        </div>
      </div>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <QuoteForm onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;