"use client";

import React, { useState } from 'react';
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

  return (
    <div className="app">
      <div className="grid grid-rows-[auto_1fr_auto] justify-items-center min-h-screen w-full">
        <NavBar setPage={setPage} />
        {page === 'logo' && (
          <>
            <ImageSubHeader text="Welcome to our Product WebApp" setPage={setPage} />
            <div className="paragraph">
              <p>Why Choose MTC?</p>
            </div>
            <section className="features">
              <div className="feature">
                <Image src={baglogo} alt="Feature 1" width={300} height={300} className="feature-image" />
                <p className="feature-text">High Quality</p>
              </div>
              <div className="feature">
                <Image src={biodegradable} alt="Feature 2" width={150} height={150} className="feature-image2" />
                <p className="feature-text">Custom Designs</p>
              </div>
              <div className="feature">
                <Image src={timelogo} alt="Feature 3" width={150} height={150} className="feature-image3" />
                <p className="feature-text">Affordable Prices</p>
              </div>
            </section>
          </>
        )}
        {page === 'product' && <h1>Product Page</h1>}
        {page === 'about' && <h1>About Us Page</h1>}
        {page === 'contact' && <h1>Contact Us Page</h1>}
        {page === 'orderinfo' && <h1>Order Information Page</h1>}
        {page === 'quote' && (
          <div>
            <h1>Get A Quote Page</h1>
            <QuoteForm onClose={() => setPage('logo')} /> {/* Render the form */}
          </div>
        )}
      </div>
    </div>
  );
}