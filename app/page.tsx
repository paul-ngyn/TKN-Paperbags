"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../app/components/NavBar/NavBar';
import LogoPage from '../app/components/LogoPage';
import ProductPage from '../app/components/ProductPage';
import AboutPage from '../app/components/AboutPage';
import '../app/globals.css';
import QuoteForm from './components/QuoteForm/QuoteForm';
import Footer from './components/Footer/Footer';

export default function Home() {
  const router = useRouter();
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

  const handleNavigation = (newPage: string) => {
    setPage(newPage);
    router.push(`/${newPage}`);
  };

  return (
    <div className="app">
      <NavBar setPage={handleNavigation} />
      <div className="container">
        {page === 'logo' && <LogoPage handleNavigation={handleNavigation} />}
        {page === 'product' && (
          <ProductPage handleOpenQuoteForm={handleOpenQuoteForm} handleNavigation={handleNavigation} />
        )}
        {page === 'about' && <AboutPage />}
        {page === 'contact' && <h1>Contact Us Page</h1>}
        {page === 'orderinfo' && <h1>Order Information Page</h1>}
        {page === 'quote' && (
          <div className={`quote-form-container ${showQuoteForm ? 'show' : ''}`}>
            <QuoteForm onClose={() => handleNavigation('logo')} /> {/* Render the form */}
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