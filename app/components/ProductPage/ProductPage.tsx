"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductImageCarousel from '../ProductImageCarousel/ProductImageCarousel';
import recyclelogo from '../../public/recyclelogo (1).png';
import tknlogo from '../../public/tkn_products (1).png';
import quoteicon from '../../public/quoteicon.png';
import customerserviceicon from '../../public/customerservice.png';
import packicon from '../../public/pack.png';
import shipicon from '../../public/shippingtruck.png';
import styles from './Productpage.module.css';
import QuoteForm from '../QuoteForm/QuoteForm';
import ProductTable from '../ProductTable/ProductTable';
import LoginRequiredPopup from '../LoginRequiredPopup/LoginRequiredPopup';
import AuthForm from '../AuthForm/AuthForm';
import { useAuth } from '../../contexts/AuthContext';
import ropehandle from '../../public/paperbagproduct.png';
import flathandle from '../../public/expos/onebag-christmas-side-white-expos.png';
import thankyou from '../../public/expos/onebag-thankyou-front-white-1.png';
import smileRope from '../../public/expos/one-bag-smile-side-white-expos.png';
import nohandle from '../../public/expos/onebagnohandle-expos.png';
import twobag from '../../public/expos/two-bag-no-handle-expos.png'
import christmasFront from '../../public/expos/onebag-white-front-christmas-expos.png'

interface ProductPageProps {
  handleNavigation: (page: string) => void;
}

const ProductPage: React.FC<ProductPageProps> = () => {
  const { user } = useAuth(); // Add auth context
  
  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState('small');
  const [selectedHandle, setSelectedHandle] = useState('flat');
  
  // Add auth-related state
  const [showLoginRequiredPopup, setShowLoginRequiredPopup] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

  const handleOpenModal = () => {
    // Check if user is authenticated before opening quote form
    if (!user) {
      setShowLoginRequiredPopup(true);
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  const handleHandleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHandle(e.target.value);
  };

  // Auth popup handlers
  const handleLoginRequiredClose = () => {
    setShowLoginRequiredPopup(false);
  };

  const handleLoginRequiredLogin = () => {
    setShowLoginRequiredPopup(false);
    setShowAuthForm(true);
  };

  const handleAuthFormClose = () => {
    setShowAuthForm(false);
  };

  // When user successfully logs in, automatically open quote form
  useEffect(() => {
    if (user && showAuthForm) {
      setShowAuthForm(false);
      setShowModal(true);
    }
  }, [user, showAuthForm]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <ProductImageCarousel images={[ropehandle, flathandle, christmasFront, twobag, thankyou, smileRope, nohandle]} />
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
            <option value="rope">Twisted</option>
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
          <button className="product-button" onClick={handleOpenModal}>
            {user ? 'Request a Quote' : 'Login to Request Quote'}
          </button>
        </div>
        <div className="processlogoContainer">
          <div className={styles.logoWithDescription}>
            <Image className={styles.logoImage} src={quoteicon} alt="Quote Logo" width={50} height={35} />
            <p className={styles.logoDescription}>QUOTE REQUESTED</p>
          </div>
          <div className="divider"></div>
          <div className={styles.logoWithDescription}>
            <Image className={styles.logoImage} src={customerserviceicon} alt="Service Logo" width={55} height={30} />
            <p className={styles.logoDescription}>CONFIRM YOUR ORDER</p>
          </div>
          <div className="divider"></div>
          <div className={styles.logoWithDescription}>
            <Image className={styles.logoImage} src={packicon} alt="Pack Logo" width={55} height={30} />
            <p className={styles.logoDescription}>CUSTOMIZED & PACKED</p>
          </div>
          <div className="divider"></div>
          <div className={styles.logoWithDescription}>
            <Image className={styles.logoImage} src={shipicon} alt="Ship Logo" width={60} height={30} />
            <p className={styles.logoDescription}>DELIVERED TO YOU</p>
          </div>
        </div>
      </div>

      {/* Quote Form Modal */}
   {showModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalBackdrop} onClick={handleCloseModal}></div>
    <div className={styles.modalContent}>
      <QuoteForm onClose={handleCloseModal} />
    </div>
  </div>
)}

      {/* Login Required Popup */}
      <LoginRequiredPopup
        isOpen={showLoginRequiredPopup}
        onClose={handleLoginRequiredClose}
        onLogin={handleLoginRequiredLogin}
        action="quote"
      />

      {/* Auth Form Modal */}
    {showAuthForm && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalBackdrop} onClick={handleAuthFormClose}></div>
    <div className={styles.loginmodalContent}>
      <AuthForm onClose={handleAuthFormClose} />
    </div>
  </div>
)}

    </div>
  );
};

export default ProductPage;