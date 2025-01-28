"use client";

import React from 'react';
import Image from 'next/image';
import ProductImage from './ProductImage/ProductImage';
import recyclelogo from '../public/recyclelogo.png';
import tknlogo from '../public/tkn_products.png';

interface ProductPageProps {
  handleOpenQuoteForm: () => void;
  handleNavigation: (page: string) => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ handleOpenQuoteForm, handleNavigation }) => {
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
          <button className="product-button" onClick={handleOpenQuoteForm}>Request a Quote</button>
          <button className="product-button" onClick={() => handleNavigation('orderinfo')}>Image Upload Details</button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;