"use client";

import React, { useState } from 'react';
import NavBar from '../app/components/NavBar/NavBar';


export default function Home() {
  const [page, setPage] = useState('home');

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <NavBar setPage={setPage} />
      {page === 'home' && <h1>Welcome to our Product WebApp</h1>}
      {page === 'product' && <h1>Product Page</h1>}
      {page === 'about' && <h1>About Us Page</h1>}
      {page === 'contact' && <h1>Contact Us Page</h1>}
    </div>
  );
}