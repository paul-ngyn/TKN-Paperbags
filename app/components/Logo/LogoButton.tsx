"use client";
import React from 'react';
import styles from './LogoButton.module.css';

interface LogoButtonProps {
  setPage: (page: string) => void;
}

const LogoButton: React.FC<LogoButtonProps> = ({ setPage }) => {
  return (
    <button onClick={() => setPage('logo')} className={styles.navButton}>
      Logo
    </button>
  );
};

export default LogoButton;