"use client";

import React, { useState, useEffect } from 'react';
import NavBar from '../app/components/NavBar/NavBar';
import ImageSubHeader from './components/ImageSubHeader/ImageSubHeader';
import '../app/globals.css';
import QuoteForm from './components/QuoteForm/QuoteForm';
import Image from 'next/image';
import Footer from './components/Footer/Footer';
import ProductImage from './components/ProductImage/ProductImage';

import baglogo from './public/baglogo.jpg';
import timelogo from './public/timelogo.jpg';
import biodegradable from './public/biodegradablelogo.jpg';
import recyclelogo from './public/recyclelogo.png';
import tknlogo from './public/tkn_products.png';

export default function Home() {
  const [page, setPage] = useState('logo');
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  useEffect(() => {
    if (page === 'quote') {
      setShowQuoteForm(true);
    } else {
      setShowQuoteForm(false);
    }
  }, [page]);

  const handleOpenQuoteForm = () => {
    setShowQuoteForm(true);
  };

  const handleCloseQuoteForm = () => {
    setShowQuoteForm(false);
  };
  return (
    <div className="app">
      <NavBar setPage={setPage} />
      <div className="container">
        {page === 'logo' && (
          <>
            <ImageSubHeader text="Welcome to our Product WebApp" setPage={setPage} />
            <div className="paragraph">
              <div className="section-title">
                <h2>Why Choose MTC?</h2>
              </div>
            </div>
            <section className="features">
            <div className="feature">
                <Image src={biodegradable} alt="Feature 2" width={150} height={150} className="feature-image2" /> 
                <p className="feature-text">Biodegradable and Recyclable</p>
                <div className="feature-description">
                  <p>Our products are environmentally friendly, biodegradable, recyclable and compostable.</p>
                </div>
              </div>
              <div className="feature">
                <Image src={baglogo} alt="Feature 1" width={150} height={150} className="feature-image" />
                <p className="feature-text">High Quality Paper Bags</p>
                <div className="feature-description">
                  <p>Our paper bags are made from the highest quality materials, ensuring durability and strength.</p>
                </div>
              </div>
              <div className="feature">
                <Image src={timelogo} alt="Feature 3" width={150} height={150} className="feature-image3" />
                <p className="feature-text">Swift and Efficient Service</p>
                <div className="feature-description">
                  <p>We provide fast and efficient service to meet your needs promptly.</p>
                </div>
              </div>
            </section>
            <div className="center-button-container">
              <button className="feature-button" onClick={() => setPage('product')}>Check Out Our Products</button>
            </div>
            <hr className="section-divider" />
            <section className="brands">
            <div className="section-title2">
                <h2>Our Brand</h2>
              </div>
              <div className="brand-container">
                <div className="brand">
                  <Image src={tknlogo} alt="TKN Logo" width={265} height={265} />
                  <div className="brand-paragraph">
                    <p>We are the exclusive distributors of TKN products. If you want to learn more about MTC and TKN, please click &apos;Learn More&apos;.</p>
                  </div>
                </div>
              </div>
              <div className = "learn-buttoncontainer">
                <button className="learn-button" onClick={() => setPage('about')}>Learn More</button>
              </div>
            </section>
            <hr className="section-divider" />
          </>
        )}
        {page === 'product' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <ProductImage />
            <div className="productDetailsContainer">
              <h2 className="productName">Paper Bag</h2>
              <div className="logoContainer">
                <Image src={recyclelogo} alt="Recycle Logo" width={40} height={15} />
                <Image src={biodegradable} alt="Biodegradable Logo" width={45} height={15} />
                <Image src={tknlogo} alt="TKN Products Logo" width={45} height={30} />
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
                <button className="product-button" onClick={handleOpenQuoteForm}>Request a Quote</button>
                <button className="product-button" onClick={() => setPage('orderinfo')}>Image Upload Details</button>
              </div>
            </div>
          </div>
        )}
        {page === 'about' && <h1>About Us Page</h1>}
        {page === 'contact' && <h1>Contact Us Page</h1>}
        {page === 'orderinfo' && <h1>Order Information Page</h1>}
        {page === 'quote' && (
          <div className={`quote-form-container ${showQuoteForm ? 'show' : ''}`}>
            <QuoteForm onClose={() => setPage('logo')} /> {/* Render the form */}
          </div>
        )}
      </div>
      {showQuoteForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <QuoteForm onClose={handleCloseQuoteForm} />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}