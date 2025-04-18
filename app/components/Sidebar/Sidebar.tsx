"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Sidebar.module.css";
import downloadicon from "../../public/downloadicon.png";

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
  startEditingDimensions?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  handleLogoUpload,
  handleClear,
  fileInputRef,
  dimensions,
  handleDimensionChange,
  startEditingDimensions = () => {} // Default empty function if prop not provided
}) => {
  // Create temporary state for in-progress dimensions
  const [tempDimensions, setTempDimensions] = useState<BagDimensions>({...dimensions});
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Update temp dimensions when props change
  useEffect(() => {
    setTempDimensions({...dimensions});
  }, [dimensions]);
  
  // Handler for dimension changes - only updates the temporary state
  const onDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    
    // Notify parent that we're in editing mode
    startEditingDimensions();
    
    // Update local state only
    setTempDimensions({
      ...tempDimensions,
      [name]: numValue 
    });
  };
  
  // Apply dimension changes when button is clicked
  const applyDimensions = () => {
    handleDimensionChange(tempDimensions);
  };
  
  // Reset to the original dimensions
  const resetDimensions = () => {
    setTempDimensions({...dimensions});
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      handleLogoUpload(e.dataTransfer.files);
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      handleLogoUpload(files);
      setFileName(files[0].name);
    }
  };

  // Click the hidden file input
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Clear logo and filename
  const handleClearClick = () => {
    setFileName(null);
    handleClear();
  };

  return (
    <div className={styles.sidebarContainer}>
      <h2 className={styles.sidebarTitle}>Design Your Bag</h2>

      <div className={styles.uploadSection}>
        <h3 className={styles.sectionTitle}>Add Logo</h3>
        <div 
          className={`${styles.dropZone} ${dragActive ? styles.dragOver : ""}`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Image
            src={downloadicon}
            alt="Upload Icon"
            width={40}
            height={40}
            className={styles.dropIcon}
          />
          <p>Drag & drop your logo here, or click to browse</p>
          {fileName && <p className={styles.fileName}>{fileName}</p>}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
        </div>
        <button onClick={handleClearClick} className={styles.clearButton}>
          Clear Logo
        </button>
      </div>
      
      <div className={styles.dimensionContainer}>
        <h3 className={styles.sectionTitle}>Bag Dimensions</h3>
        <div className={styles.dimensionInputs}>
          <div className={styles.inputGroup}>
            <label htmlFor="length">Length (mm)</label>
            <input
              type="number"
              id="length"
              name="length"
              value={tempDimensions.length}
              onChange={onDimensionChange}
              min="100"
              max="2000"
              className={styles.dimensionInput}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="width">Width (mm)</label>
            <input
              type="number"
              id="width"
              name="width"
              value={tempDimensions.width}
              onChange={onDimensionChange}
              min="50"
              max="500"
              className={styles.dimensionInput}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="height">Height (mm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={tempDimensions.height}
              onChange={onDimensionChange}
              min="100"
              max="1000"
              className={styles.dimensionInput}
            />
          </div>
        </div>
        
        {/* Buttons to apply or reset dimensions */}
        <div className={styles.buttonGroup}>
          <button 
            onClick={applyDimensions} 
            className={styles.applyButton}
            disabled={
              JSON.stringify(tempDimensions) === JSON.stringify(dimensions)
            }
          >
            Apply Dimensions
          </button>
          <button 
            onClick={resetDimensions} 
            className={styles.resetButton}
            disabled={
              JSON.stringify(tempDimensions) === JSON.stringify(dimensions)
            }
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;