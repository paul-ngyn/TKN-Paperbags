"use client";
import React, { useState } from 'react';
import styles from './QuoteReqButton.module.css';
import QuoteForm from '../QuoteForm/QuoteForm';

const QuoteReqButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div>
      <button onClick={handleOpenModal} className={styles.navButton}>
        Get a Quote
      </button>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <QuoteForm onClose={handleCloseModal} />
          </div>
          <div className={styles.modalBackdrop} onClick={handleCloseModal}></div>
        </div>
      )}
    </div>
  );
};

export default QuoteReqButton;