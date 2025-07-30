"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { SavedDesign } from '../../types/design';
import styles from './SavedDesignPage.module.css';

const SavedDesignsPage: React.FC = () => {
  const { user } = useAuth();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchDesigns();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDesigns = async () => {
    try {
      const response = await fetch('/api/designs');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch designs');
      }
      
      setDesigns(data.designs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design?')) {
      return;
    }

    try {
      const response = await fetch(`/api/designs/${designId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete design');
      }
      
      setDesigns(designs.filter(d => d.id !== designId));
    } catch {
      setError('Failed to delete design');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.notLoggedIn}>
          <h2>Please log in to view your saved designs</h2>
          <p>You need to be logged in to access your saved designs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Saved Designs</h1>
        <p>Manage all your saved paper bag designs</p>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your designs...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>
          <h3>Error Loading Designs</h3>
          <p>{error}</p>
          <button onClick={fetchDesigns} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      ) : designs.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h2>No Designs Saved Currently</h2>
          <p>You haven&apos;t saved any designs yet. Start creating your custom paper bag designs and save them here for easy access.</p>
          <div className={styles.emptyActions}>
            <a href="/design" className={styles.createButton}>
              Create Your First Design
            </a>
          </div>
        </div>
      ) : (
        <div className={styles.designsGrid}>
          {designs.map((design) => (
            <div key={design.id} className={styles.designCard}>
              {design.preview_image && (
                <div className={styles.designPreview}>
                  <Image 
                    src={design.preview_image} 
                    alt={design.name}
                    width={350}
                    height={200}
                    className={styles.previewImage}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
              
              <div className={styles.designInfo}>
                <h3>{design.name}</h3>
                {design.description && (
                  <p className={styles.description}>{design.description}</p>
                )}
                <div className={styles.designMeta}>
                  <div className={styles.dimensions}>
                    📏 {design.dimensions.length}&quot; × {design.dimensions.width}&quot; × {design.dimensions.height}&quot;
                  </div>
                  <div className={styles.logoCount}>
                    🏷️ {design.logos.length} logo{design.logos.length !== 1 ? 's' : ''}
                  </div>
                  <div className={styles.lastModified}>
                    🕒 {formatDate(design.updated_at)}
                  </div>
                </div>
              </div>
              
              <div className={styles.designActions}>
                <a 
                  href={`/design?load=${design.id}`}
                  className={styles.editButton}
                >
                  Edit Design
                </a>
                <button 
                  onClick={() => handleDeleteDesign(design.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {designs.length > 0 && (
        <div className={styles.footer}>
          <p>{designs.length} design{designs.length !== 1 ? 's' : ''} saved</p>
          <a href="/design" className={styles.newDesignButton}>
            + Create New Design
          </a>
        </div>
      )}
    </div>
  );
};

export default SavedDesignsPage;