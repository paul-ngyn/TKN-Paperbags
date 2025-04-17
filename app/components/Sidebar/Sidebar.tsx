"use client";
import React from "react";
import styles from "./Sidebar.module.css";

// Import the BagDimensions interface or define it here
interface BagDimensions {
  length: number;
  width: number;
  height: number;
}

interface SidebarProps {
  handleLogoUpload: (files: FileList) => void;
  handleClear: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  dimensions: BagDimensions;
  handleDimensionChange: (dimensions: BagDimensions) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  handleLogoUpload,
  handleClear,
  fileInputRef,
  dimensions,
  handleDimensionChange,
}) => {
  
  // Add handler for dimension changes
  const onDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    handleDimensionChange({
      ...dimensions,
      [name]: numValue
    });
  };

  return (
    <div className={styles.sidebarContainer}>
      <h2 className={styles.sidebarTitle}>Design Your Bag</h2>
      
      <div className={styles.dimensionContainer}>
        <h3>Bag Dimensions</h3>
        <div className={styles.dimensionInputs}>
          <div className={styles.inputGroup}>
            <label htmlFor="length">Length (mm)</label>
            <input
              type="number"
              id="length"
              name="length"
              value={dimensions.length}
              onChange={onDimensionChange}
              min="100"
              max="2000"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="width">Width (mm)</label>
            <input
              type="number"
              id="width"
              name="width"
              value={dimensions.width}
              onChange={onDimensionChange}
              min="50"
              max="500"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="height">Height (mm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={dimensions.height}
              onChange={onDimensionChange}
              min="100"
              max="1000"
            />
          </div>
        </div>
      </div>
      
      <div className={styles.uploadSection}>
        <h3>Add Logo</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && handleLogoUpload(e.target.files)}
          ref={fileInputRef}
          className={styles.fileInput}
        />
        <button onClick={handleClear} className={styles.clearButton}>
          Clear Logo
        </button>
      </div>
      
      <div className={styles.colorSection}>
        <h3>Choose Bag Color</h3>
        {/* Add color picker here */}
      </div>
    </div>
  );
};

export default Sidebar;