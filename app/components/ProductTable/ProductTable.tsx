"use client";

import React from 'react';
import styles from './ProductTable.module.css';

interface ProductTableProps {
  selectedOption: string;
  selectedHandle: string;
}

interface HandleData {
  dimensions: string;
  capacity: string;
  price: string;
  quantity: number;
  weight: string;
}

interface SizeData {
  [handle: string]: HandleData;
}

const sizeData: Record<string, SizeData> = {
  small: {
    none: {
      dimensions: '10x11x17',
      capacity: '5 KG',
      price: '$0.50',
      quantity: 250,
      weight: '28 LB'
    },
    rope: {
      dimensions: '10x11x13',
      capacity: '5 KG',
      price: '$0.55',
      quantity: 250,
      weight: '30 LB'
    },
    flat: {
      dimensions: '10x11x12',
      capacity: '5 KG',
      price: '$0.50',
      quantity: 250,
      weight: '28 LB'
    }
  },
  medium: {
    none: {
      dimensions: '12x12x17',
      capacity: '10 KG',
      price: '$0.75',
      quantity: 250,
      weight: '28 LB'
    },
    rope: {
      dimensions: '12x12x15',
      capacity: '10 KG',
      price: '$0.80',
      quantity: 250,
      weight: '30 LB'
    },
    flat: {
      dimensions: '12x12x14',
      capacity: '10 KG',
      price: '$0.75',
      quantity: 250,
      weight: '28 LB'
    }
  },
  large: {
    none: {
      dimensions: '14x13x19',
      capacity: '20 KG',
      price: '$1.00',
      quantity: 250,
      weight: '28 LB'
    },
    rope: {
      dimensions: '14x13x16',
      capacity: '20 KG',
      price: '$1.05',
      quantity: 250,
      weight: '30 LB'
    },
    flat: {
      dimensions: '14x13x14',
      capacity: '20 KG',
      price: '$1.00',
      quantity: 250,
      weight: '28 LB'
    }
  },
  // Add more sizes and handle types here
};

const ProductTable: React.FC<ProductTableProps> = ({ selectedOption, selectedHandle }) => {
  const data = sizeData[selectedOption]?.[selectedHandle];

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
          <td>Weight</td>
          <td>{data.weight}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default ProductTable;