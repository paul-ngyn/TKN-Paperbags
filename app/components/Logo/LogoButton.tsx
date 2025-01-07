"use client";
import React from 'react';
import styles from './LogoButton.module.css';
import Image from 'next/image';
import Mtc from '../../public/MTC-logo.png';

interface LogoButtonProps {
  setPage: (page: string) => void;
}

const LogoButton: React.FC<LogoButtonProps> = ({ setPage }) => {
  return (
    <button onClick={() => setPage('logo')} className={styles.navButton}>
      <Image src={Mtc} alt="MTC Logo" width={100} height={60} />
    </button>
  );
};

export default LogoButton;