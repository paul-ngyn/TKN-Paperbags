"use client";

import React, { useState, useEffect } from 'react';
import NavBar from '../app/components/NavBar/NavBar';
import ImageSubHeader from './components/ImageSubHeader/ImageSubHeader';
import '../app/globals.css';
import QuoteForm from './components/QuoteForm/QuoteForm';
import Image from 'next/image';

import baglogo from './public/baglogo.jpg';
import recyclelogo from './public/recyclelogo.png';
import timelogo from './public/timelogo.jpg';
import biodegradable from './public/biodegradablelogo.jpg';

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

  return (
    <div className="app">
      <NavBar setPage={setPage} />
      <div className="container">
        {page === 'logo' && (
          <>
            <ImageSubHeader text="Welcome to our Product WebApp" setPage={setPage} />
            <div className="paragraph">
              <p>Why Choose MTC?</p>
            </div>
            <section className="features">
              <div className="feature">
                <Image src={baglogo} alt="Feature 1" width={300} height={300} className="feature-image" />
                <p className="feature-text">High Quality Paper Bags</p>
              </div>
              <div className="feature">
                <Image src={biodegradable} alt="Feature 2" width={150} height={150} className="feature-image2" />
                <p className="feature-text">Biodegradable and Compostable</p>
              </div>
              <div className="feature">
                <Image src={timelogo} alt="Feature 3" width={150} height={150} className="feature-image3" />
                <p className="feature-text">Swift and Efficient Service</p>
              </div>
            </section>
          </>
        )}
        {page === 'product' && <h1>Product Page</h1>}
        {page === 'about' && <h1>About Us Page</h1>}
        {page === 'contact' && <h1>Contact Us Page</h1>}
        {page === 'orderinfo' && <h1>Order Information Page</h1>}
        {page === 'quote' && (
          <div className={`quote-form-container ${showQuoteForm ? 'show' : ''}`}>
            <QuoteForm onClose={() => setPage('logo')} /> {/* Render the form */}
          </div>
        )}
      </div>
    </div>
  );
}