"use client";

import React, {useState} from 'react';
import styles from './ImageSubHeader.module.css';
import QuoteForm from '../QuoteForm/QuoteForm';

interface ImageSubHeaderProps {
  text: string;
  setPage: (page: string) => void;
}

const ImageSubHeader: React.FC<ImageSubHeaderProps> = ({ setPage }) => {
  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  return (
    <div className={styles.subHeader}>
      <div className={styles.overlayText}>
        CUSTOM PAPER BAGS AT WHOLESALE PRICES.<br /> INSTANTLY DESIGNED BY YOU.
      </div>
      <button className={styles.designButton} onClick={handleOpenModal}>
        GET A QUOTE NOW
      </button>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <QuoteForm onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSubHeader;