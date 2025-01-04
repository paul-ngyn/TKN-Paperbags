"use client";

import React, { useState } from 'react';
import NavBar from '../app/components/NavBar/NavBar';
import ImageSubHeader from './components/ImageSubHeader/ImageSubHeader';
import '../app/globals.css';
import QuoteForm from './components/QuoteForm/QuoteForm';

export default function Home() {
  const [page, setPage] = useState('logo');

  return (
    <div className="app">
      <div className="grid grid-rows-[auto_1fr_auto] justify-items-center min-h-screen w-full">
        <NavBar setPage={setPage} />
        {page === 'logo' && (
          <>
            <ImageSubHeader text="Welcome to our Product WebApp" />
            <div className="paragraph">
              <p>
                At MTC we are dedicated to offering custom quality paper bags. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
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