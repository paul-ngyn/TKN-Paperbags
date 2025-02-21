"use client";

import React, {useState} from 'react';
import Image from 'next/image';
import ProductImageCarousel from '../ProductImageCarousel/ProductImageCarousel';
import recyclelogo from '../../public/recyclelogo.png';
import tknlogo from '../../public/tkn_products.png';
import quoteicon from '../../public/quoteicon.png';
import customerserviceicon from '../../public/customerservice.png';
import packicon from '../../public/pack.png';
import shipicon from '../../public/shippingtruck.png';
import styles from './Productpage.module.css';
import QuoteForm from '../QuoteForm/QuoteForm';
import ProductTable from '../ProductTable/ProductTable';
import ropehandle from '../../public/paperbagproduct.jpg';
import flathandle from '../../public/flathandle1.jpeg';
import flathandle2 from '../../public/flathandle2.jpg.jpeg';
import nohandle from '../../public/nohandle.jpeg';

interface ProductPageProps {
  handleNavigation: (page: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProductPage: React.FC<ProductPageProps> = ({ handleNavigation }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState('small');
  const [selectedHandle, setSelectedHandle] = useState('flat');
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  const handleHandleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHandle(e.target.value);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <ProductImageCarousel images={[ropehandle, flathandle, flathandle2, nohandle]} />
      <div className="productDetailsContainer">
        <h2 className="productName">Kraft Paper Bag</h2>
        <div className="logoContainer">
          <Image src={recyclelogo} alt="Recycle Logo" width={38} height={20} />
          <Image src={tknlogo} alt="TKN Products Logo" width={38} height={30} />
        </div>
        <p className="productDescription">
          Our customizable kraft paper bags are made from the highest quality materials, ensuring durability and strength.
        </p>
        <p className="productGuidelines">
          Please note that sizes listed below are for reference only. Bag dimensions are fully customizable and customers should input their desired dimensions and handle type when requesting a quote.
        </p>
        <div className="productOptions">
          <label htmlFor="productOptions">Select a Size:</label>
          <select id="productOptions" name="productOptions" value={selectedOption} onChange={handleOptionChange}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div className="productOptions">
          <label htmlFor="handleOptions">Select a Handle Type:</label>
          <select id="handleOptions" name="handleOptions" value={selectedHandle} onChange={handleHandleChange}>
            <option value="none">None</option>
            <option value="rope">Rope</option>
            <option value="flat">Flat</option>
          </select>
        </div>
        <div className={styles.navigation}>
        <a href="/design" className="product-button-link">
          Design Your Bag
        </a>
        <span className={styles.separator}> - </span>
        <a href="/orderinfo" className="product-button-link">
          Image Upload Details
        </a>
      </div>
        <ProductTable selectedOption={selectedOption} selectedHandle={selectedHandle} />
        <p className="productSubject">
          *Pricing may vary based on customization and quantity. Please request a quote for more information.
        </p>
        <div className="buttonContainer">
          <button className="product-button" onClick={handleOpenModal}>Request a Quote</button>
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
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className={styles.modalContent}>
            <QuoteForm onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;