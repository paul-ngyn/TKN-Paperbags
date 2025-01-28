"use client";
import React from 'react';
import styles from './ContactUsButton.module.css';

interface ContactUsButtonProps {
  onClick: (page: string) => void;
}

const ContactUsButton: React.FC<ContactUsButtonProps> = ({ onClick }) => {
  return (
    <button onClick={() => onClick('contact')} className={styles.navButton}>
      Contact Us
    </button>
  );
};

export default ContactUsButton;