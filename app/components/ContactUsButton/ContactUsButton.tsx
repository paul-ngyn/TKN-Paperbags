"use client";
import React from 'react';
import styles from './ContactUsButton.module.css';

interface ContactUsButtonProps {
  setPage: (page: string) => void;
}

const ContactUsButton: React.FC<ContactUsButtonProps> = ({ setPage }) => {
  return (
    <button onClick={() => setPage('contact')} className={styles.navButton}>
      Contact Us
    </button>
  );
};

export default ContactUsButton;