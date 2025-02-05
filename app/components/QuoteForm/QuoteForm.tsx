"use client";
import React, { useState } from 'react';
import styles from './QuoteForm.module.css';

interface QuoteFormProps {
  onClose: () => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    details: '',
    pdf: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file && file.type === 'application/pdf') {
        setFormData({
          ...formData,
          pdf: file,
        });
      } else {
        alert('Please upload a valid PDF file.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Quote Request Submitted:', formData);
    alert('Your quote request has been submitted!');
    onClose();
  };

  return (
    <div className={styles.formContainer}>
      <h2>Get A Quote</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.nameGroup}>
      <div className={styles.formGroup}>
          <label htmlFor="firstName">First Name</label>
          <input
            className={styles.inputField}
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="lastName">Last Name</label>
          <input
            className={styles.inputField}
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            className={styles.inputField}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone #</label>
          <input
            className={styles.inputField}
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="details">Details</label>
          <textarea
            className={styles.inputField}
            id="details"
            name="details"
            value={formData.details}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="pdf">Upload PDF</label>
          <input
            type="file"
            id="pdf"
            name="pdf"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            Submit
          </button>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuoteForm;
