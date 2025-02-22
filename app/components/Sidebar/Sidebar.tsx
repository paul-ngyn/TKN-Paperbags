"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./Sidebar.module.css";
import downloadIcon from "../../public/downloadicon.png";

interface SidebarProps {
  handleLogoUpload: (files: FileList) => void;
  handleClear: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleBagChange: (bag: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  handleLogoUpload,
  handleClear,
  fileInputRef,
  handleBagChange
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Wrapper for the file input change event
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      handleLogoUpload(files);
      setFileName(files[0].name); // Set the filename
    }
  };

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
      setFileName(e.dataTransfer.files[0].name); // Set the filename
    }
  };

  // Click on the hidden file input
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Clear the filename and call the parent handleClear function
  const handleClearClick = () => {
    setFileName(null); // Clear the filename
    handleClear(); // Call the parent handleClear function
  };

  const handleBagSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleBagChange(e.target.value);
  };

  return (
    <div className={styles.sidebarContainer}>
        <h1 className={styles.sidebarTitle}>Upload Your Logo</h1>
      <div
        className={`${styles.dropZone} ${dragActive ? styles.dragOver : ""}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <img
          src={downloadIcon.src}
          alt="Dropzone Icon"
          className={styles.dropIcon}
        />
        <p>Drag & drop your logo here, or click to browse</p>
        {fileName && <p className={styles.fileName}>{fileName}</p>}
        {/* Hidden file input */}
        <input
          type="file"
          id="logoUpload"
          accept="image/png"
          onChange={handleFileInputChange}   // call our wrapper
          ref={fileInputRef}
          style={{ display: "none" }}
        />
      </div>
      <Link href="/orderinfo" className={styles.navLink}>
        Image Upload Details
      </Link>
      <div className={styles.dropdownContainer}>
        <label htmlFor="bagSelect" className={styles.dropdownLabel}>Select Bag:</label>
        <select id="bagSelect" className={styles.dropdown} onChange={handleBagSelect}>
          <option value="ropehandle">Rope Handle</option>
          <option value="flathandle">Flat Handle</option>
          <option value="nohandle">No Handle</option>
        </select>
      </div>
      <div className={styles.navigation}>
        <button onClick={handleClearClick} className={styles.navButton}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default Sidebar;