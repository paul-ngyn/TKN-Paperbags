"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image"; // This is Next.js Image component
import Link from "next/link";
import styles from "./Sidebar.module.css";
import downloadicon from "../../public/downloadicon.png";
import BlueprintExample from "../../public/BlueprintExample.png";
import { BagDimensions, mmToInches} from "../../util/BagDimensions";


// Extended props to support text customization
interface SidebarProps {
  handleLogoUpload: (files: FileList) => void;
  onUploadError?: (message: string) => void; // For parent component to handle errors
  handleAddText: (text?: string, style?: TextStyle) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  dimensions: BagDimensions;
  handleDimensionChange: (dimensions: BagDimensions) => void;
  startEditingDimensions?: () => void;
  downloadDesign: () => Promise<boolean> | void;
  logoCount?: number;
  activeLogoId?: string | null;
  activeLogoText?: string;
  activeLogoTextStyle?: TextStyle;
  updateTextContent?: (id: string, text: string, style: TextStyle) => void;
  onLogoDeselect?: () => void;
}

interface TextStyle {
  fontFamily: string;                   
  fontSize: number;
  color: string;
  fontWeight: string;
  rotation?: number;
}

// Define image requirements
const IMAGE_REQUIREMENTS = {
  minWidth: 100,        // Minimum width in pixels
  minHeight: 100,       // Minimum height in pixels
  maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
};

// Helper function to validate the image file
const validateImageFile = (file: File): Promise<{ isValid: boolean; error?: string }> => {
  return new Promise((resolve) => {
    // Check file type
    if (!IMAGE_REQUIREMENTS.allowedTypes.includes(file.type)) {
      resolve({ 
        isValid: false, 
        error: `Invalid file type. Please use: ${IMAGE_REQUIREMENTS.allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}` 
      });
      return;
    }

    // Check file size
    if (file.size > IMAGE_REQUIREMENTS.maxFileSize) {
      resolve({ 
        isValid: false, 
        error: `File too large. Maximum size is ${IMAGE_REQUIREMENTS.maxFileSize / (1024 * 1024)}MB.` 
      });
      return;
    }

    // Check image dimensions using the native Image constructor
    const img = new window.Image(); // Use window.Image to ensure native browser API
    img.onload = () => {
      if (img.width < IMAGE_REQUIREMENTS.minWidth || img.height < IMAGE_REQUIREMENTS.minHeight) {
        resolve({ 
          isValid: false, 
          error: `Image too small. Minimum dimensions: ${IMAGE_REQUIREMENTS.minWidth}x${IMAGE_REQUIREMENTS.minHeight}px. Your image: ${img.width}x${img.height}px.` 
        });
      } else {
        resolve({ isValid: true });
      }
      URL.revokeObjectURL(img.src); // Clean up object URL
    };
    
    img.onerror = () => {
      resolve({ 
        isValid: false, 
        error: 'Invalid image file or corrupted file. Could not read dimensions.' 
      });
      URL.revokeObjectURL(img.src); // Clean up object URL
    };
    
    img.src = URL.createObjectURL(file);
  });
};


const Sidebar: React.FC<SidebarProps> = ({
  handleLogoUpload,
  onUploadError, 
  handleAddText,
  fileInputRef,
  dimensions,
  handleDimensionChange,
  startEditingDimensions = () => {}, 
  downloadDesign,
  logoCount = 0,
  activeLogoId = null,
  activeLogoText = "",
  activeLogoTextStyle,
  updateTextContent,
  onLogoDeselect,
}) => {

  const [showBlueprintExample, setShowBlueprintExample] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'default' | 'text'>('default');
  const [textInput, setTextInput] = useState('Your text here');
  const [textStyle, setTextStyle] = useState<TextStyle>({
    fontFamily: 'Arial',
    fontSize: 24,
    color: '#000000',
    fontWeight: 'normal',
    rotation: 0 
  });
  const [inputValues, setInputValues] = useState({
    length: "",
    width: "",
    height: ""
  });
  const [tempDimensionsInches, setTempDimensionsInches] = useState<{
    length: number;
    width: number;
    height: number;
  }>({
    length: mmToInches(dimensions.length, 2),
    width: mmToInches(dimensions.width, 2),
    height: mmToInches(dimensions.height, 2)
  });
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Add state for upload validation
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  

  useEffect(() => {
    if (activeLogoId && activeLogoText && activeLogoTextStyle) {
      setTextInput(activeLogoText);
      setTextStyle({
        fontFamily: activeLogoTextStyle.fontFamily,
        fontSize: activeLogoTextStyle.fontSize, 
        color: activeLogoTextStyle.color,
        fontWeight: activeLogoTextStyle.fontWeight,
        rotation: activeLogoTextStyle.rotation || 0
      });
      setSidebarMode('text');
    } else if (sidebarMode === 'text' && !activeLogoId) {
      setTextInput('Your text here');
      setTextStyle({
        fontFamily: 'Arial',
        fontSize: 24, 
        color: '#000000',
        fontWeight: 'normal',
        rotation: 0 
      });
    }
  }, [activeLogoId, activeLogoText, activeLogoTextStyle, sidebarMode]);


  const MAX_DIMENSIONS = {
    length: 21.65, 
    width: 11.81,
    height: 22.14 
  };

  const MIN_DIMENSIONS = {
    length: 6,
    width: 2,
    height: 6
  };
  
  const inchesToMm = (inches: number) => {
    return +(inches * 25.4).toFixed(2);
  };
  

  useEffect(() => {
    const lengthInches = mmToInches(dimensions.length, 2);
    const widthInches = mmToInches(dimensions.width, 2);
    const tabsideHeightInches = mmToInches(dimensions.height, 2);
    
    setTempDimensionsInches({
      length: lengthInches,
      width: widthInches,
      height: tabsideHeightInches
    });
    
    setInputValues({
      length: lengthInches.toString(),
      width: widthInches.toString(),
      height: tabsideHeightInches.toString()
    });
  }, [dimensions]);
  
  
  const onDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues({ ...inputValues, [name]: value });
    if (value && !isNaN(parseFloat(value))) {
      const numValue = parseFloat(value);
      setTempDimensionsInches({ ...tempDimensionsInches, [name]: numValue });
      startEditingDimensions();
    }
  };
  
  const applyDimensions = () => {
    const clampedDimensions = {
      length: Math.min(Math.max(tempDimensionsInches.length, MIN_DIMENSIONS.length), MAX_DIMENSIONS.length),
      width: Math.min(Math.max(tempDimensionsInches.width, MIN_DIMENSIONS.width), MAX_DIMENSIONS.width),
      height: Math.min(Math.max(tempDimensionsInches.height, MIN_DIMENSIONS.height), MAX_DIMENSIONS.height)
    };
    setInputValues({
      length: clampedDimensions.length.toString(),
      width: clampedDimensions.width.toString(),
      height: clampedDimensions.height.toString()
    });
    setTempDimensionsInches(clampedDimensions);
    const newDimensions = {
      length: inchesToMm(clampedDimensions.length),
      width: inchesToMm(clampedDimensions.width),
      height: inchesToMm(clampedDimensions.height)
    };
    handleDimensionChange(newDimensions);
  };

  const onDimensionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyDimensions();
    }
  };
  
  const resetDimensions = () => {
    const lengthInches = mmToInches(dimensions.length, 2);
    const widthInches = mmToInches(dimensions.width, 2);
    const heightInches = mmToInches(dimensions.height, 2);
    setTempDimensionsInches({ length: lengthInches, width: widthInches, height: heightInches });
    setInputValues({ length: lengthInches.toString(), width: widthInches.toString(), height: heightInches.toString() });
  };

  // Function to handle file validation and upload
  const validateAndUploadFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    setIsValidating(true);
    setUploadError(null);
    setFileName(null); // Clear previous file name

    const file = files[0]; // Assuming single file upload for now
    const validationResult = await validateImageFile(file);

    if (!validationResult.isValid) {
      setUploadError(validationResult.error || 'Invalid file.');
      if (onUploadError) {
        onUploadError(validationResult.error || 'Invalid file.');
      }
      setIsValidating(false);
      return;
    }


    handleLogoUpload(files);
    setFileName(file.name); 
    setIsValidating(false);
  };


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
    setUploadError(null); 
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      await validateAndUploadFiles(e.dataTransfer.files);
    }
  };


  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      await validateAndUploadFiles(files);
    }
  };


  const handleClick = () => {
    setUploadError(null); // Clear errors when user clicks to browse
    fileInputRef.current?.click();
  };


  const handleAddTextClick = () => {
    setSidebarMode('text');
    setTextInput('Your text here');
    setTextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#000000',
      fontWeight: 'normal',
      rotation: 0 // Ensure rotation is set here
    });
  };
  
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
  };

  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rotationValue = parseInt(e.target.value, 10);
    setTextStyle(prev => ({ ...prev, rotation: rotationValue }));
  };
  
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTextStyle(prev => ({ ...prev, fontFamily: e.target.value }));
  };
  
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value, 10) }));
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextStyle(prev => ({ ...prev, color: e.target.value }));
  };
  
  const handleFontWeightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTextStyle(prev => ({ ...prev, fontWeight: e.target.value }));
  };
  
  const applyTextChanges = () => {
    const finalTextStyle = {
      ...textStyle,
      rotation: textStyle.rotation || 0 
    };
    if (activeLogoId && updateTextContent) {
      updateTextContent(activeLogoId, textInput, finalTextStyle);
    } else {
      handleAddText(textInput, finalTextStyle);
    }
    setSidebarMode('default');
  };
  
  const cancelTextChanges = () => {
    setSidebarMode('default');
  };

  const dimensionsChanged = () => {
    const originalInches = {
      length: mmToInches(dimensions.length, 2),
      width: mmToInches(dimensions.width, 2),
      height: mmToInches(dimensions.height, 2)
    };
    const epsilon = 0.005; 
    return (
      Math.abs(originalInches.length - tempDimensionsInches.length) > epsilon ||
      Math.abs(originalInches.width - tempDimensionsInches.width) > epsilon ||
      Math.abs(originalInches.height - tempDimensionsInches.height) > epsilon
    );
  };

  const dimensionOutOfRange = (name: string, value: number): boolean => {
    if (name === 'length') return value < MIN_DIMENSIONS.length || value > MAX_DIMENSIONS.length;
    if (name === 'width') return value < MIN_DIMENSIONS.width || value > MAX_DIMENSIONS.width;
    if (name === 'height') return value < MIN_DIMENSIONS.height || value > MAX_DIMENSIONS.height;
    return false;
  };

  const getInputClass = (name: string): string => {
    const value = tempDimensionsInches[name as keyof typeof tempDimensionsInches];
    return dimensionOutOfRange(name, value) 
      ? `${styles.dimensionInput} ${styles.outOfRange}` 
      : styles.dimensionInput;
  };

  return (
    <div className={styles.sidebarContainer}>
      <h2 className={styles.sidebarTitle}>Design Your Bag</h2>

 
      <div className={styles.tabNavigation}>
      <button 
        className={`${styles.tabButton} ${sidebarMode === 'default' ? styles.activeTab : ''}`}
        onClick={() => {
          setSidebarMode('default');
          if (activeLogoId && onLogoDeselect) {
            onLogoDeselect();
          }
        }}
      >
        Upload
      </button>
      <button 
        className={`${styles.tabButton} ${sidebarMode === 'text' ? styles.activeTab : ''}`}
        onClick={handleAddTextClick} 
      >
        Text
      </button>
    </div>

   
      {sidebarMode === 'default' && (
        <div className={styles.uploadSection}>
          <div 
            className={`${styles.dropZone} ${dragActive ? styles.dragOver : ""} ${uploadError ? styles.error : ""}`} // Add error class
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
            {isValidating ? (
              <p>Validating image...</p>
            ) : (
              <>
                <p>Drag & drop your logos here, or click to browse</p>
                <div className={styles.requirements}>
                  <small>
                    Min Dimensions: {IMAGE_REQUIREMENTS.minWidth} x {IMAGE_REQUIREMENTS.minHeight}px
                  </small>
                  
                  <small>
                    Max Size: {IMAGE_REQUIREMENTS.maxFileSize / (1024 * 1024)}MB
                  </small>
  
                  <small>
                   Supported File Formats: {IMAGE_REQUIREMENTS.allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
                  </small>
                </div>
              </>
            )}
            {fileName && !uploadError && (
              <p className={styles.fileName}>Selected: {fileName}</p>
            )}
            {uploadError && (
              <p className={styles.errorMessage}>{uploadError}</p>
            )}
            <input
              type="file"
              accept={IMAGE_REQUIREMENTS.allowedTypes.join(',')} // Set accept attribute
              onChange={handleFileInputChange} // Updated to use validation
              ref={fileInputRef}
              style={{ display: "none" }}
            />
          </div>
          <div className={styles.buttonInfoGroup}>
            {logoCount > 0 && (
              <p className={styles.logoCount}>
                {logoCount} logo{logoCount !== 1 ? 's' : ''} added
              </p>
            )}
            <button 
              onClick={handleClick} // Updated to clear errors
              className={styles.addLogoButton}
              disabled={isValidating} // Disable button while validating
            >
              {isValidating ? 'Validating...' : `Add ${logoCount > 0 ? 'Another' : 'New'} Logo`}
            </button>
          </div>
        </div>
      )}

      {sidebarMode === 'text' && (
        <div className={styles.textInputSection}>
          <h3>{activeLogoId ? 'Edit Text' : 'Add New Text:'}</h3>
          
          <div className={styles.formGroup}>
            <textarea
              id="text-input"
              value={textInput}
              onChange={handleTextChange}
              className={styles.textArea}
              rows={3}
              placeholder="Enter your text here"
            />
          </div>

          <div className={styles.formGroup}>
        <label htmlFor="font-family">Font:</label>
        <select 
          id="font-family" 
          value={textStyle.fontFamily}
          onChange={handleFontFamilyChange}
          className={styles.fontSelect} 
        >
          <optgroup label="Classic & Web Safe">
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Impact">Impact</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
          </optgroup>

          <optgroup label="Modern Sans-Serif">
            <option value="Inter">Inter</option>
            <option value="Poppins">Poppins</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Nunito">Nunito</option>
            <option value="Rubik">Rubik</option>
            <option value="Work Sans">Work Sans</option>
            <option value="Exo 2">Exo 2</option>
          </optgroup>

          <optgroup label="Display & Impact">
            <option value="Oswald">Oswald</option>
            <option value="Bebas Neue">Bebas Neue</option>
            <option value="Anton">Anton</option>
            <option value="Raleway">Raleway</option>
            <option value="Fredoka One">Fredoka One</option>
            <option value="Righteous">Righteous</option>
            <option value="Alfa Slab One">Alfa Slab One</option>
            <option value="Black Ops One">Black Ops One</option>
            <option value="Bungee">Bungee</option>
            <option value="Orbitron">Orbitron</option>
            <option value="Russo One">Russo One</option>
            <option value="Staatliches">Staatliches</option>
          </optgroup>

          <optgroup label="Elegant Serif">
            <option value="Playfair Display">Playfair Display</option>
            <option value="Merriweather">Merriweather</option>
            <option value="Crimson Text">Crimson Text</option>
            <option value="Libre Baskerville">Libre Baskerville</option>
            <option value="Cormorant Garamond">Cormorant Garamond</option>
            <option value="EB Garamond">EB Garamond</option>
          </optgroup>
          <optgroup label="Script & Handwritten">
            <option value="Pacifico">Pacifico</option>
            <option value="Dancing Script">Dancing Script</option>
            <option value="Great Vibes">Great Vibes</option>
            <option value="Satisfy">Satisfy</option>
            <option value="Kaushan Script">Kaushan Script</option>
            <option value="Caveat">Caveat</option>
            <option value="Indie Flower">Indie Flower</option>
            <option value="Shadows Into Light">Shadows Into Light</option>
            <option value="Permanent Marker">Permanent Marker</option>
            <option value="Architects Daughter">Architects Daughter</option>
            <option value="Kalam">Kalam</option>
          </optgroup>
          
          <optgroup label="Unique & Thematic">
            <option value="Amatic SC">Amatic SC</option>
          </optgroup>

          <optgroup label="Monospace & Code">
            <option value="Fira Code">Fira Code</option>
            <option value="Space Mono">Space Mono</option>
            <option value="JetBrains Mono">JetBrains Mono</option>
          </optgroup>
        </select>
      </div>


          <div className={styles.formGroup}>
            <label htmlFor="font-size">Size: {textStyle.fontSize}px</label>
            <input
              id="font-size"
              type="range"
              min="10"
              max="64"
              value={textStyle.fontSize}
              onChange={handleFontSizeChange}
              className={styles.slider}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="text-color">Color:</label>
            <div className={styles.colorPickerContainer}>
              <input
                id="text-color"
                type="color"
                value={textStyle.color}
                onChange={handleColorChange}
                className={styles.colorPicker}
              />
              <span className={styles.colorValue}>{textStyle.color}</span>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="font-weight">Style:</label>
            <select
              id="font-weight"
              value={textStyle.fontWeight}
              onChange={handleFontWeightChange}
              className={styles.select}
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>

          <div className={styles.formGroup}>
          <label htmlFor="text-rotation">Rotation: {textStyle.rotation}°</label>
          <input
            id="text-rotation"
            type="range"
            min="-180"
            max="180"
            value={textStyle.rotation || 0}
            onChange={handleRotationChange}
            className={styles.slider}
          />
        </div>
        
          <div className={styles.buttonGroupText}>
            <button 
              onClick={applyTextChanges} 
              className={styles.applyButton}
            >
              {activeLogoId ? 'Update Text' : 'Add to Design'}
            </button>
            <button 
              onClick={cancelTextChanges} 
              className={styles.resetButton}
            >
              Cancel
            </button>
          </div>
          <div className={styles.textPreviewContainer}>
          <p 
            className={styles.textPreview}
            style={{
              fontFamily: textStyle.fontFamily,
              fontSize: `${textStyle.fontSize}px`,
              color: textStyle.color,
              fontWeight: textStyle.fontWeight
              // No rotation included
            }}
          >
            {textInput || "Preview"}
          </p>
        </div>
          
          <div className={styles.downloadButtonContainer}>
            <button 
              onClick={() => {
                if (typeof downloadDesign === 'function') {
                  downloadDesign();
                } else {
                  console.error("No download function available");
                  alert("Unable to download design at this time.");
                }
              }}
              className={styles.downloadButton}
            >
              Download Design
            </button>
          </div>
        </div>
      )}

      {sidebarMode === 'default' && (
        <>
          <div className={styles.infoLinkContainer}>
            <Link href="/orderinfo" className={styles.infoLink}>
              Image Upload Details
            </Link>
            <span className={styles.linkSeparator}>-</span>
            <button 
              onClick={() => setShowBlueprintExample(true)}
              className={styles.infoLink}
            >
              Blueprint Example
            </button>
          </div>
          
          <div className={styles.dimensionContainer}>
            <h3 className={styles.sectionTitle}>Customize Your Bag Dimensions</h3>
            <div className={styles.dimensionInputs}>
              <div className={styles.inputGroup}>
                <label htmlFor="length">Length (in)</label>
                <input
                  type="number"
                  id="length"
                  name="length"
                  value={inputValues.length}
                  onChange={onDimensionChange}
                  onKeyDown={onDimensionKeyDown}
                  min={MIN_DIMENSIONS.length}
                  max={MAX_DIMENSIONS.length}
                  step="0.01"
                  className={getInputClass('length')}
                />
                <div className={styles.dimensionLimits}>
                  <span className={styles.minDimension}>Min: {MIN_DIMENSIONS.length}&quot;</span>
                  <span className={styles.maxDimension}>Max: {MAX_DIMENSIONS.length}&quot;</span>
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="width">Width (in)</label>
                <input
                  type="number"
                  id="width"
                  name="width"
                  value={inputValues.width}
                  onChange={onDimensionChange}
                  onKeyDown={onDimensionKeyDown}
                  min={MIN_DIMENSIONS.width}
                  max={MAX_DIMENSIONS.width}
                  step="0.01"
                  className={getInputClass('width')}
                />
                <div className={styles.dimensionLimits}>
                  <span className={styles.minDimension}>Min: {MIN_DIMENSIONS.width}&quot;</span>
                  <span className={styles.maxDimension}>Max: {MAX_DIMENSIONS.width}&quot;</span>
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="height">Height (in)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={inputValues.height}
                  onChange={onDimensionChange}
                  onKeyDown={onDimensionKeyDown}
                  min={MIN_DIMENSIONS.height}
                  max={MAX_DIMENSIONS.height}
                  step="0.01"
                  className={getInputClass('height')}
                />
                <div className={styles.dimensionLimits}>
                  <span className={styles.minDimension}>Min: {MIN_DIMENSIONS.height}&quot;</span>
                  <span className={styles.maxDimension}>Max: {MAX_DIMENSIONS.height}&quot;</span>
                </div>
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                onClick={applyDimensions} 
                className={styles.applyButton}
                disabled={!dimensionsChanged()}
              >
                Apply Dimensions
              </button>
              <button 
                onClick={resetDimensions} 
                className={styles.resetButton}
                disabled={!dimensionsChanged()}
              >
                Reset
              </button>
            </div>

            <div className={styles.downloadButtonContainer}>
              <button 
                onClick={() => {
                  if (typeof downloadDesign === 'function') {
                    downloadDesign();
                  } else {
                    console.error("No download function available");
                    alert("Unable to download design at this time.");
                  }
                }}
                className={styles.downloadButton}
              >
                Download Design
              </button>
            </div>
          </div>
        </>
      )}
      
      {showBlueprintExample && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button 
              className={styles.closeButton} 
              onClick={() => setShowBlueprintExample(false)}
            >
              &times;
            </button>
            <div className={styles.blueprintImageContainer}>
              <Image
                src={BlueprintExample}
                alt="Blueprint Example"
                width={1400}
                height={1200}
                className={styles.blueprintImage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;