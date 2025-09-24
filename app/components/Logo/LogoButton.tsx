"use client";

import React from 'react';
import styles from './LogoButton.module.css';
import Image from 'next/image';
import Mtc from '../../public/MTC-logo.png';

interface LogoButtonProps {
  onClick: () => void;
}

const LogoButton: React.FC<LogoButtonProps> = ({ onClick }) => {
  return (
     <button onClick={onClick} className={styles.navButton}>
    <Image 
      src={Mtc} 
      alt="MTC Logo" 
      width={86} 
      height={50} 
      suppressHydrationWarning={true}
    />
  </button>
  );
};

export default LogoButton;