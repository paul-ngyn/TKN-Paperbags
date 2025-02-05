"use client";

import React from 'react';
import styles from './ProductTable.module.css';

interface ProductTableProps {
  selectedOption: string;
}

interface SizeData {
  dimensions: string;
  capacity: string;
  price: string;
  quantity: number;
  handle: string;
  weight: string;
}

const sizeData: Record<string, SizeData> = {
  small: {
    dimensions: '10x11',
    capacity: '5 KG',
    price: '$0.50',
    quantity: 250,
    handle: 'Rope / Flat',
    weight: '28 / 35 LB'
  },
  medium: {
    dimensions: '12x12',
    capacity: '10 KG',
    price: '$0.75',
    quantity: 250,
    handle: 'Rope / Flat',
    weight: '28 / 35 LB'
  },
  large: {
    dimensions: '14x13',
    capacity: '20 KG',
    price: '$1.00',
    quantity: 250,
    handle: 'Rope / Flat',
     weight: '28 / 35 LB'
  },
  // Add more sizes here
};

const ProductTable: React.FC<ProductTableProps> = ({ selectedOption }) => {
  const data = sizeData[selectedOption];

  if (!data) {
    return null;
  }

  return (
    <table className={styles.productTable}>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Dimensions</td>
          <td>{data.dimensions}</td>
        </tr>
        <tr>
          <td>Capacity</td>
          <td>{data.capacity}</td>
        </tr>
        <tr>
          <td>Price</td>
          <td>{data.price}</td>
        </tr>
        <tr>
          <td>Quantity</td>
          <td>{data.quantity}</td>
        </tr>
        <tr>
          <td>Handle</td>
          <td>{data.handle}</td>
        </tr>
        <tr>
          <td>Weight</td>
          <td>{data.weight}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default ProductTable;