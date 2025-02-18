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
    dimension1: '',
    dimension2: '',
    dimension3: '',
    handletype: '',
    details: '',
    pdf: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('dimensions', `${formData.dimension1} x ${formData.dimension2} x ${formData.dimension3}`);
    data.append('handletype', formData.handletype);
    data.append('details', formData.details);
    if (formData.pdf) {
      data.append('pdf', formData.pdf);
    }

    try {
      const response = await fetch('/api/sendQuote', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        throw new Error('Failed to send quote request');
      }

      alert('Your quote request has been submitted! You should receive a copy of your quote shortly.');
      onClose();
    } catch (error) {
      console.error('Error submitting quote:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.heading}>Get a Quote</h2>
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
          <label htmlFor="dimensions">Bag Dimensions</label>
          <div className={styles.dimensionsGroup}>
            <input
              className={styles.dimensioninputField}
              type="text"
              id="dimension1"
              name="dimension1"
              value={formData.dimension1}
              onChange={handleChange}
              required
            />
            <span className={styles.dimensionSeparator}>x</span>
            <input
              className={styles.dimensioninputField}
              type="text"
              id="dimension2"
              name="dimension2"
              value={formData.dimension2}
              onChange={handleChange}
              required
            />
            <span className={styles.dimensionSeparator}>x</span>
            <input
              className={styles.dimensioninputField}
              type="text"
              id="dimension3"
              name="dimension3"
              value={formData.dimension3}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className={styles.formGroup}>
        <label htmlFor="handletype">Handle Type</label>
        <select
          className={styles.inputField}
          id="handletype"
          name="handletype"
          value={formData.handletype}
          onChange={handleChange}
          required
        >
          <option value="">Please Select a Handle Type</option>
          <option value="rope">Rope</option>
          <option value="flat">Flat</option>
          <option value="none">None</option>
        </select>
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
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
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
