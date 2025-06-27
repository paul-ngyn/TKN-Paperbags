"use client";
import React, { useState } from 'react';
import styles from './QuoteForm.module.css';

interface QuoteFormProps {
  onClose: () => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ onClose }) => {
  // Define the same min/max dimensions as in the Sidebar component
  const MAX_DIMENSIONS = {
    length: 21.65, 
    width: 11.81,
    height: 22.1
  };

  const MIN_DIMENSIONS = {
    length: 6,
    width: 2,
    height: 6
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    quantity: '',
    dimension1: '',
    dimension2: '',
    dimension3: '',
    handletype: '',
    details: '',
    pdf: null as File | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [dimensionErrors, setDimensionErrors] = useState({
    dimension1: false,
    dimension2: false,
    dimension3: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Check dimension validity for dimension fields
    if (['dimension1', 'dimension2', 'dimension3'].includes(e.target.name)) {
      validateDimension(e.target.name, e.target.value);
    }
  };

  // Validate dimensions against min/max constraints
  const validateDimension = (name: string, value: string) => {
    const numValue = parseFloat(value);
    let isError = false;

    if (!isNaN(numValue)) {
      if (name === 'dimension1') { // Length
        isError = numValue < MIN_DIMENSIONS.length || numValue > MAX_DIMENSIONS.length;
      } else if (name === 'dimension2') { // Width
        isError = numValue < MIN_DIMENSIONS.width || numValue > MAX_DIMENSIONS.width;
      } else if (name === 'dimension3') { // Height
        isError = numValue < MIN_DIMENSIONS.height || numValue > MAX_DIMENSIONS.height;
      }
    }

    setDimensionErrors(prev => ({
      ...prev,
      [name]: isError
    }));
  };

  // Check if any dimension errors exist
  const hasDimensionErrors = () => {
    return dimensionErrors.dimension1 || 
           dimensionErrors.dimension2 || 
           dimensionErrors.dimension3 ||
           !formData.dimension1 ||
           !formData.dimension2 ||
           !formData.dimension3;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file && file.type === 'application/pdf') {
        setFormData({
          ...formData,
          pdf: file
        });
        setPdfFileName(file.name);
      } else {
        alert('Please upload a valid PDF file.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Double check all dimensions are within constraints
    validateDimension('dimension1', formData.dimension1);
    validateDimension('dimension2', formData.dimension2);
    validateDimension('dimension3', formData.dimension3);
    
    if (hasDimensionErrors()) {
      alert('Please ensure all dimensions are within the allowed range.');
      return;
    }
    
    setIsSubmitting(true);

    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('quantity', formData.quantity);
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

  // Get appropriate CSS class based on validation state
  const getDimensionClass = (fieldName: string) => {
    return dimensionErrors[fieldName as keyof typeof dimensionErrors] 
      ? `${styles.dimensioninputField} ${styles.dimensionError}` 
      : styles.dimensioninputField;
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
          <label htmlFor="quantity">Order Quantity</label>
          <input
            className={styles.inputField}
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="dimensions">Bag Dimensions (in inches)</label>
          <div className={styles.dimensionsGroup}>
            <div className={styles.dimensionInputContainer}>
              <input
                className={getDimensionClass('dimension1')}
                type="number"
                id="dimension1"
                name="dimension1"
                value={formData.dimension1}
                onChange={handleChange}
                min={MIN_DIMENSIONS.length}
                max={MAX_DIMENSIONS.length}
                step="0.01"
                required
              />
              <div className={styles.dimensionInfo}>
                <small>Length: {MIN_DIMENSIONS.length}&quot; - {MAX_DIMENSIONS.length}&quot;</small>
              </div>
            </div>
            <span className={styles.dimensionSeparator}>x</span>
            <div className={styles.dimensionInputContainer}>
              <input
                className={getDimensionClass('dimension2')}
                type="number"
                id="dimension2"
                name="dimension2"
                value={formData.dimension2}
                onChange={handleChange}
                min={MIN_DIMENSIONS.width}
                max={MAX_DIMENSIONS.width}
                step="0.01"
                required
              />
              <div className={styles.dimensionInfo}>
                <small>Width: {MIN_DIMENSIONS.width}&quot; - {MAX_DIMENSIONS.width}&quot;</small>
              </div>
            </div>
            <span className={styles.dimensionSeparator}>x</span>
            <div className={styles.dimensionInputContainer}>
              <input
                className={getDimensionClass('dimension3')}
                type="number"
                id="dimension3"
                name="dimension3"
                value={formData.dimension3}
                onChange={handleChange}
                min={MIN_DIMENSIONS.height}
                max={MAX_DIMENSIONS.height}
                step="0.01"
                required
              />
              <div className={styles.dimensionInfo}>
                <small>Height: {MIN_DIMENSIONS.height}&quot; - {MAX_DIMENSIONS.height}&quot;</small>
              </div>
            </div>
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
          <label htmlFor="pdf">Upload Design PDF</label>
          <input
            type="file"
            id="pdf"
            name="pdf"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          {pdfFileName && (
            <p className={styles.fileName}>Selected: {pdfFileName}</p>
          )}
        </div>
        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.submitButton} 
            disabled={isSubmitting || hasDimensionErrors()}
          >
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