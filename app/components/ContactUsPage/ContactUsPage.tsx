"use client";

import React, { useState } from 'react';
import styles from './ContactUsPage.module.css';

interface ContactPageProps {
  handleNavigation?: (page: string) => void;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ContactPage: React.FC<ContactPageProps> = ({ handleNavigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    details: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('company', formData.company);
    data.append('details', formData.details);

    try {
      const response = await fetch('/api/sendHelp', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        throw new Error('Failed to send contact request');
      }

      alert('Thank you for contacting us!');
      // Optionally navigate or reset form
      // if (handleNavigation) handleNavigation('somePage');
    } catch (error) {
      console.error('Error submitting contact form:', error);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.mainTitle}>Contact Us Page</h1>
      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>How can we help?</h2>
        <p className={styles.subtitle}>
      We are happy to help with custom orders and any product-related questions.
        </p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="company">Company:</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="details">Details:</label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <button className={styles.submitButton} type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;