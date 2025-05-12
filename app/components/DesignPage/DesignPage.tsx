"use client";
import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import Sidebar from "../Sidebar/Sidebar";
import BagBlueprint from "../BagBlueprint/BagBlueprint";
import styles from "./DesignPage.module.css";
import resizeIcon from "../../public/resize-68.png";
import duplicateIcon from "../../public/duplicate-icon.png";
import Image from "next/image";
import jsPDF from "jspdf";
import {svg2pdf} from "svg2pdf.js";
import { BagDimensions, calculateBagDimensions } from "../../util/BagDimensions";

interface DesignPageProps {
  handleNavigation: (page: string) => void;
}

interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: string;
}

interface Logo {
  id: string;
  type: 'image' | 'text';
  src?: string;
  text?: string;
  textStyle?: TextStyle;
  position: { x: number, y: number };
  size: { width: number, height: number };
}

const DesignPage: React.FC<DesignPageProps> = () => {
  // State declarations
  const [logos, setLogos] = useState<Logo[]>([]);
  const [activeLogoId, setActiveLogoId] = useState<string | null>(null);
  const [draggable, setDraggable] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [dimensions, setDimensions] = useState<BagDimensions>({
    length: 310,
    width: 155,
    height: 428
  });
  const [isEditingDimensions, setIsEditingDimensions] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoRefs = useRef<Map<string, React.RefObject<Rnd>>>(new Map());
  const bagContainerRef = useRef<HTMLDivElement>(null);
  
  // Calculate size constraints for text elements
  // Replace the existing calculateTextConstraints function with this improved version
const calculateTextConstraints = (text: string, fontSize: number, lineBreaks: number = 0) => {
  const charWidthFactor = fontSize * 0.6;
  
  // Handle multi-line text differently than single-line text
  const hasLineBreaks = lineBreaks > 0;
  
  if (hasLineBreaks) {
    // For multi-line text, calculate based on the longest line
    const lines = text.split('\n');
    const longestLineLength = Math.max(...lines.map(line => line.length));
    const longestLineWidth = longestLineLength * charWidthFactor;
    
    return {
      minWidth: Math.max(100, Math.min(300, longestLineWidth * 0.8)),
      maxWidth: Math.min(600, Math.max(200, longestLineWidth * 1.5)),
      minHeight: Math.max(60, (lineBreaks + 1) * fontSize * 1.5),
      maxHeight: Math.min(500, (lineBreaks + 1) * fontSize * 3)
    };
  } else {
    // For single-line text, use the original logic
    const textWidth = text.length * charWidthFactor;
    
    return {
      minWidth: Math.max(100, Math.min(300, textWidth * 0.8)),
      maxWidth: Math.min(500, Math.max(200, textWidth * 1.5)),
      minHeight: Math.max(40, fontSize * 1.5),
      maxHeight: Math.min(300, fontSize * 3)
    };
  }
};
  
  // Generate PDF function
  const generatePDF = async () => {
    console.log("Starting PDF generation with accurate physical dimensions...");
    
    try {
      // Use the BagDimensions utility for calculations
      const calculatedDim = calculateBagDimensions(dimensions);
      
      // Get SVG viewBox dimensions
      const tempSvgElement = document.querySelector(".bagBlueprint svg") || document.querySelector("svg");
      let svgViewBoxWidth = calculatedDim.totalWidthMM + 150;
      let svgViewBoxHeight = calculatedDim.totalHeightMM + 150;
      
      if (tempSvgElement instanceof SVGElement) {
        const tempViewBox = tempSvgElement.getAttribute('viewBox');
        const tempViewBoxValues = tempViewBox ? tempViewBox.split(' ').map(Number) : [0, 0, svgViewBoxWidth, svgViewBoxHeight];
        svgViewBoxWidth = tempViewBoxValues[2];
        svgViewBoxHeight = tempViewBoxValues[3];
      }
      
      // Calculate PDF dimensions
      const MM_TO_INCHES = 1 / 25.4;
      const requiredBlueprintWidthInches = svgViewBoxWidth * MM_TO_INCHES;
      const requiredBlueprintHeightInches = svgViewBoxHeight * MM_TO_INCHES;
      const marginInches = 2;
      
      const pdfWidthInches = Math.ceil(requiredBlueprintWidthInches + (marginInches * 2));
      const pdfHeightInches = Math.ceil(requiredBlueprintHeightInches + (marginInches * 2));
      const pdfOrientation = pdfWidthInches > pdfHeightInches ? "landscape" as const : "portrait" as const;
      const xPos = (pdfWidthInches - requiredBlueprintWidthInches) / 2;
      const yPos = (pdfHeightInches - requiredBlueprintHeightInches) / 2;

      // Create PDF
      const pdf = new jsPDF({
        orientation: pdfOrientation,
        unit: "in",
        format: [pdfWidthInches, pdfHeightInches],
        compress: false, 
        hotfixes: ["scale_correction"] 
      });
      
      // Add blueprint to PDF
      const bagBlueprintElement = document.querySelector(".bagBlueprint svg") || document.querySelector("svg");
      if (!(bagBlueprintElement instanceof SVGElement)) {
        console.warn("SVG element not found");
        return false;
      }
      
      const svgClone = bagBlueprintElement.cloneNode(true) as SVGElement;
      svgClone.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      await svg2pdf(svgClone, pdf, {
        x: xPos,
        y: yPos,
        width: requiredBlueprintWidthInches,
        height: requiredBlueprintHeightInches
      });
                  
      // Calculate logo positioning scales
      const bagContainerRect = bagContainerRef.current?.getBoundingClientRect() || { width: 0, height: 0 };
      const scaleX = requiredBlueprintWidthInches / bagContainerRect.width;
      const scaleY = requiredBlueprintHeightInches / bagContainerRect.height;
      
      // Add logos to PDF
      if (logos.length > 0) {
        for (const logo of logos) {
          try {
            const logoXInPDF = xPos + (logo.position.x * scaleX);
            const logoYInPDF = yPos + (logo.position.y * scaleY);
            const logoWidthInPDF = logo.size.width * scaleX;
            const logoHeightInPDF = logo.size.height * scaleY;
            
            // Process based on logo type
            if (logo.type === 'text' && logo.text) {
              addTextToPdf(pdf, logo, logoXInPDF, logoYInPDF, logoWidthInPDF, logoHeightInPDF, scaleX, scaleY);
            } else if (logo.type === 'image' && logo.src) {
              pdf.addImage(logo.src, 'PNG', logoXInPDF, logoYInPDF, logoWidthInPDF, logoHeightInPDF);
            } else {
              console.warn(`Skipping logo ${logo.id} - invalid type or missing content`);
            }
          } catch (err) {
            console.error(`Failed to add logo/text ${logo.id}:`, err);
          }
        }
      }
      
      // Save PDF
      pdf.save(`MTC-Bag-Design-${calculatedDim.totalWidthInches.toFixed(2)}x${calculatedDim.totalHeightInches.toFixed(2)}-inches_Physical.pdf`);
      return true;
      
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Sorry, we couldn't generate your PDF. Please try again.");
      return false;
    }
  };
  
  // Helper function to add text to PDF
  const addTextToPdf = (pdf: jsPDF, logo: Logo, x: number, y: number, width: number, height: number, scaleX: number, scaleY: number) => {
    try {
      // Create canvas for text rendering
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Could not create canvas context");
      }
      
      // Set canvas properties - higher ratio for better quality
      const pixelRatio = 5;
      canvas.width = logo.size.width * pixelRatio;
      canvas.height = logo.size.height * pixelRatio;
      ctx.scale(pixelRatio, pixelRatio);
      
      // Clear canvas
      ctx.clearRect(0, 0, logo.size.width, logo.size.height);
      
      // Set text styling
      const fontWeight = logo.textStyle?.fontWeight || 'normal';
      const fontSize = logo.textStyle?.fontSize || 24;
      const fontFamily = logo.textStyle?.fontFamily || 'Arial';
      const color = logo.textStyle?.color || '#000000';
      
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const text = logo.text || '';
      const hasLineBreaks = text.includes('\n');
      
      // Different rendering approach based on text type
      if (hasLineBreaks) {
        // For multi-line text, explicitly handle line positioning
        const lineHeight = fontSize * 1.4;
        const centerX = logo.size.width / 2 - (fontSize * 0.09); 
        
        // Calculate actual text bounds for proper vertical centering
        const lines = text.split('\n');
        const totalTextHeight = lines.length * lineHeight;
        
        // Start position for first line (centered vertically)
        const startY = (logo.size.height - totalTextHeight) / 2 + lineHeight / 2;
        
        // Draw each line separately
        lines.forEach((line, index) => {
          ctx.fillText(line, centerX, startY + (index * lineHeight));
        });
      } else {
        // For single-line text, simple centered positioning
        const centerX = logo.size.width / 2 - (fontSize * 0.09);
        const centerY = logo.size.height / 2 - (fontSize * 0.14);
        // Add a small vertical offset (8% of font size) to visually center single-line text
        const verticalOffset = fontSize * 0.08;
        ctx.fillText(text, centerX, centerY + verticalOffset);
      }
      
      // Convert to image and add to PDF
      const textImageDataUrl = canvas.toDataURL('image/png');
      pdf.addImage(textImageDataUrl, 'PNG', x, y, width, height);
      
    } catch (err) {
      console.log("Falling back to standard text rendering:", err);
      
      // Standard PDF text rendering as fallback
      const fontFamily = logo.textStyle?.fontFamily || 'helvetica';
      let pdfFontName = 'helvetica';
      
      if (fontFamily.toLowerCase().includes('times')) {
        pdfFontName = 'times';
      } else if (fontFamily.toLowerCase().includes('courier')) {
        pdfFontName = 'courier';
      }
      
      const fontStyle = logo.textStyle?.fontWeight === 'bold' ? 'bold' : 'normal';
      pdf.setFont(pdfFontName, fontStyle);
      
      const fontSize = logo.textStyle?.fontSize || 24;
      const scaleFactor = Math.min(scaleX, scaleY);
      const scaledFontSize = Math.max(16, fontSize * scaleFactor * 71);
      pdf.setFontSize(scaledFontSize);
      
      // Set text color
      const color = logo.textStyle?.color || '#000000';
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      pdf.setTextColor(r, g, b);
      
      // Position and render
      const textX = x + (width / 2);
      const textY = y + (height / 2);
      
      const text = logo.text || '';
      if (text.includes('\n')) {
        // For multi-line text in fallback mode
        const lines = text.split('\n');
        pdf.text(lines, textX, textY, {
          align: 'center',
          baseline: 'middle'
        });
      } else {
        pdf.text(text, textX, textY, {
          align: 'center',
          baseline: 'middle'
        });
      }
    }
  };
  
  // Handle logo upload
  const handleLogoUpload = (files: FileList) => {
    if (!files.length) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        const newLogo: Logo = {
          id: `logo-${Date.now()}`,
          type: 'image',
          src: e.target.result,
          position: { x: 50, y: 50 },
          size: { width: 150, height: 150 }
        };
        
        logoRefs.current.set(newLogo.id, React.createRef<Rnd>());
        setLogos(prev => [...prev, newLogo]);
        setActiveLogoId(newLogo.id);
        setDraggable(true);
        setIsActive(true);
      }
    };
    
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle adding text
  const handleAddText = (text?: string, style?: TextStyle) => {
    const textContent = text || "Your text here";
    const textStyle = style || {
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#000000',
      fontWeight: 'normal'
    };
    
    const newTextLogo: Logo = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: textContent,
      textStyle: textStyle,
      position: { x: 50, y: 50 },
      size: { width: 200, height: 60 }
    };
    
    logoRefs.current.set(newTextLogo.id, React.createRef<Rnd>());
    setLogos(prev => [...prev, newTextLogo]);
    setActiveLogoId(newTextLogo.id);
    setDraggable(true);
    setIsActive(true);
  };
  
  // Update text content and styling with proper constraints
  const updateTextContent = (id: string, text: string, style: TextStyle) => {
    setLogos(prev => prev.map(logo => {
      if (logo.id === id) {
        // Calculate size constraints based on new text
        const lineBreaks = (text.match(/\n/g) || []).length;
        const constraints = calculateTextConstraints(text, style.fontSize, lineBreaks);
        
        // Ensure size is within new constraints
        const newSize = {
          width: Math.min(constraints.maxWidth, Math.max(constraints.minWidth, logo.size.width)),
          height: Math.min(constraints.maxHeight, Math.max(constraints.minHeight, logo.size.height))
        };
        
        return { ...logo, text, textStyle: style, size: newSize };
      }
      return logo;
    }));
    
    // Update the component size if needed
    const logo = logos.find(l => l.id === id);
    if (logo && logoRefs.current.get(logo.id)?.current) {
      const constraints = calculateTextConstraints(text, style.fontSize);
      const newSize = {
        width: Math.min(constraints.maxWidth, Math.max(constraints.minWidth, logo.size.width)),
        height: Math.min(constraints.maxHeight, Math.max(constraints.minHeight, logo.size.height))
      };
      
      logoRefs.current.get(logo.id)?.current?.updateSize(newSize);
    }
  };

  // Logo operations (delete, duplicate, move)
  const handleLogoDelete = (logoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setLogos(prev => prev.filter(logo => logo.id !== logoId));
    logoRefs.current.delete(logoId);
    
    if (activeLogoId === logoId) {
      setActiveLogoId(null);
      setDraggable(false);
      setIsActive(false);
    }
  };

  const handleDuplicateLogo = (logoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const logoToDuplicate = logos.find(logo => logo.id === logoId);
    if (!logoToDuplicate) return;
    
    const newLogo: Logo = {
      id: `${logoToDuplicate.type}-${Date.now()}`,
      type: logoToDuplicate.type,
      src: logoToDuplicate.src,
      text: logoToDuplicate.text,
      textStyle: logoToDuplicate.textStyle ? {...logoToDuplicate.textStyle} : undefined,
      position: { 
        x: logoToDuplicate.position.x + 20, 
        y: logoToDuplicate.position.y + 20 
      },
      size: { ...logoToDuplicate.size }
    };
    
    logoRefs.current.set(newLogo.id, React.createRef<Rnd>());
    setLogos(prev => [...prev, newLogo]);
    setActiveLogoId(newLogo.id);
    setDraggable(true);
    setIsActive(true);
  };

  const handleLogoMove = (
    logoId: string, 
    position: {x: number, y: number}, 
    size?: {width: number, height: number},
    textStyle?: TextStyle
  ) => {
    setLogos(prev => prev.map(logo => {
      if (logo.id === logoId) {
        return {
          ...logo,
          position,
          size: size || logo.size,
          textStyle: textStyle || logo.textStyle
        };
      }
      return logo;
    }));
  };
  
  // UI interaction handlers
  const toggleDragMode = (logoId: string) => {
    setActiveLogoId(logoId);
    setIsActive(true);
    if (activeLogoId !== logoId || !draggable) {
      setDraggable(true);
      
      // Check if we need to validate text element's size constraints
      const selectedLogo = logos.find(logo => logo.id === logoId);
      if (selectedLogo?.type === 'text' && selectedLogo.textStyle) {
        // Get the Rnd reference
        const rndRef = logoRefs.current.get(logoId);
        if (rndRef?.current) {
          // Calculate proper constraints based on current text and font size
          const text = selectedLogo.text || '';
          const lineBreaks = (text.match(/\n/g) || []).length;
          const fontSize = selectedLogo.textStyle.fontSize;
          const constraints = calculateTextConstraints(text, fontSize, lineBreaks);
          
          // Check if current size meets constraints
          const needsResize = 
            selectedLogo.size.width < constraints.minWidth || 
            selectedLogo.size.height < constraints.minHeight;
          
          if (needsResize) {
            // Update element size to meet minimum constraints
            const newSize = {
              width: Math.max(constraints.minWidth, selectedLogo.size.width),
              height: Math.max(constraints.minHeight, selectedLogo.size.height)
            };
            
            // Update both the state and the component
            handleLogoMove(logoId, selectedLogo.position, newSize);
            rndRef.current.updateSize(newSize);
          }
        }
      }
    }
  };
  
  const handleBagClick = (e: React.MouseEvent) => {
    if (e.currentTarget === e.target) {
      setActiveLogoId(null);
      setDraggable(false);
      setIsActive(false);
    }
  };
  
  // Dimensions editing
  const startEditingDimensions = () => setIsEditingDimensions(true);
  const handleDimensionChange = (newDimensions: BagDimensions) => {
    setDimensions(newDimensions);
    setIsEditingDimensions(false);
  };

  const handleLogoDeselect = () => {
    setActiveLogoId(null);
    setDraggable(false);
    setIsActive(false);
  };
  
  return (
    <div className={styles.pageContainer}>
      <Sidebar
        handleLogoUpload={handleLogoUpload}
        handleAddText={handleAddText}
        fileInputRef={fileInputRef}
        dimensions={dimensions}
        handleDimensionChange={handleDimensionChange}
        startEditingDimensions={startEditingDimensions}
        downloadDesign={generatePDF}
        logoCount={logos.length}
        activeLogoId={activeLogoId}
        activeLogoText={logos.find(logo => logo.id === activeLogoId && logo.type === 'text')?.text || ''}
        activeLogoTextStyle={logos.find(logo => logo.id === activeLogoId && logo.type === 'text')?.textStyle}
        updateTextContent={updateTextContent}
        onLogoDeselect={handleLogoDeselect}
      />
      
      <div 
        className={styles.bagContainer} 
        ref={bagContainerRef}
        onClick={handleBagClick}
      >
        <BagBlueprint 
          dimensions={dimensions} 
          isEditing={isEditingDimensions}
          currentEditValues={isEditingDimensions ? dimensions : undefined}
        />

        {logos.map((logo) => {
          const isLogoActive = logo.id === activeLogoId;
          return (
            <Rnd
                key={logo.id}
                default={{ 
                  x: logo.position.x, 
                  y: logo.position.y, 
                  width: logo.size.width, 
                  height: logo.size.height 
                }}
                position={{ x: logo.position.x, y: logo.position.y }}
                size={{ width: logo.size.width, height: logo.size.height }}
                bounds="parent"
                disableDragging={!(isLogoActive && draggable)}
                enableResizing={isLogoActive && draggable ? { bottomRight: true } : false}
                minWidth={logo.type === 'text' ? 
                  (() => {
                    if (logo.text) {
                      const lineBreaks = (logo.text.match(/\n/g) || []).length;
                      if (lineBreaks > 0) {
                        const lines = logo.text.split('\n');
                        const longestLineLength = Math.max(...lines.map(line => line.length));
                        return Math.max(100, longestLineLength * (logo.textStyle?.fontSize || 24) * 0.4);
                      }
                    }
                    return Math.max(100, ((logo.text?.length || 10) * (logo.textStyle?.fontSize || 24) * 0.5));
                  })() : 50
                }
                maxWidth={logo.type === 'text' ? 
                  (() => {
                    if (logo.text) {
                      const lineBreaks = (logo.text.match(/\n/g) || []).length;
                      if (lineBreaks > 0) {
                        const lines = logo.text.split('\n');
                        const longestLineLength = Math.max(...lines.map(line => line.length));
                        return Math.min(600, longestLineLength * (logo.textStyle?.fontSize || 24) * 1.2);
                      }
                    }
                    return Math.min(500, ((logo.text?.length || 10) * (logo.textStyle?.fontSize || 24) * 1.2));
                  })() : 800
                }
                minHeight={logo.type === 'text' ? 
                  (() => {
                    if (logo.text) {
                      const lineBreaks = (logo.text.match(/\n/g) || []).length;
                      if (lineBreaks > 0) {
                        return Math.max(60, (lineBreaks + 1) * (logo.textStyle?.fontSize || 24) * 1.2);
                      }
                    }
                    return Math.max(40, ((logo.textStyle?.fontSize || 24) * 1.5));
                  })() : 50
                }
                maxHeight={logo.type === 'text' ? 
                  (() => {
                    if (logo.text) {
                      const lineBreaks = (logo.text.match(/\n/g) || []).length;
                      if (lineBreaks > 0) {
                        return Math.min(500, (lineBreaks + 1) * (logo.textStyle?.fontSize || 24) * 3);
                      }
                    }
                    return Math.min(300, ((logo.textStyle?.fontSize || 24) * 5));
                  })() : 800
                }
                onDragStart={() => {}}
                onDrag={(e, d) => handleLogoMove(logo.id, {x: d.x, y: d.y})}
                onDragStop={(e, d) => handleLogoMove(logo.id, {x: d.x, y: d.y})}
                onResize={(e, direction, ref, delta, position) => {
                  const newWidth = parseInt(ref.style.width);
                  const newHeight = parseInt(ref.style.height);
                  const resizedLogo = logos.find(l => l.id === logo.id);
                  
                  if (resizedLogo?.type === 'text' && resizedLogo.textStyle) {
                    const text = resizedLogo.text || '';
                    const lineBreaks = (text.match(/\n/g) || []).length;
                    const hasLineBreaks = lineBreaks > 0;
                    const fontSize = resizedLogo.textStyle.fontSize;
                    
                    // Get the current text aspect ratio and dimensions to maintain proportion
                    const currentRatio = resizedLogo.size.width / resizedLogo.size.height;
                    
                    // Calculate optimal font size based on container dimensions
                    let newFontSize = fontSize;
                    let optimalWidth = newWidth;
                    let optimalHeight = newHeight;
                    
                    if (hasLineBreaks) {
                      // For multi-line text, calculate differently
                      const lines = text.split('\n');
                      const lineCount = lines.length;
                      const longestLine = Math.max(...lines.map(line => line.length));
                      
                      // Determine font size from height first for multi-line text
                      const heightBasedFontSize = Math.max(12, Math.min(64, 
                        Math.floor(newHeight / (lineCount * 1.5))
                      ));
                      
                      // Check if width is sufficient for this font size
                      const requiredWidth = longestLine * heightBasedFontSize * 0.6;
                      
                      if (requiredWidth > newWidth) {
                        // If width is too small, adjust font size based on width
                        newFontSize = Math.max(12, Math.min(heightBasedFontSize, 
                          Math.floor((newWidth / longestLine) * 1.6)
                        ));
                      } else {
                        newFontSize = heightBasedFontSize;
                      }
                      
                      // Ensure minimum height for readability
                      optimalHeight = Math.max(
                        newHeight, 
                        (lineCount * newFontSize * 1.5)
                      );
                    } else {
                      // For single-line text, use primarily width-based sizing
                      // but maintain a reasonable height-to-width ratio
                      const textLength = text.length || 10;
                      const widthRatio = newWidth / resizedLogo.size.width;
                      
                      // Start with width-based font size
                      newFontSize = Math.max(12, Math.min(64, 
                        Math.floor(fontSize * widthRatio)
                      ));
                      
                      // Check if height is sufficient for this font size
                      const requiredHeight = newFontSize * 1.5;
                      
                      if (requiredHeight > newHeight) {
                        // If height is too small, adjust
                        newFontSize = Math.max(12, Math.floor(newHeight / 1.5));
                      }
                      
                      // Ensure box isn't too tall for single line text
                      optimalHeight = Math.min(
                        newHeight,
                        Math.max(newFontSize * 2, newHeight)
                      );
                    }
                    
                    // Create updated style and size objects
                    const updatedTextStyle = {
                      ...resizedLogo.textStyle,
                      fontSize: newFontSize
                    };
                
                    // Apply the changes
                    handleLogoMove(
                      logo.id,
                      position,
                      { width: optimalWidth, height: optimalHeight },
                      updatedTextStyle
                    );
                    
                    // Update the Rnd component's size directly for immediate visual feedback
                    if (logoRefs.current.get(logo.id)?.current) {
                      logoRefs.current.get(logo.id)?.current?.updateSize({
                        width: optimalWidth,
                        height: optimalHeight
                      });
                    }
                  } else {
                    // For images, use the existing behavior
                    handleLogoMove(logo.id, position, { width: newWidth, height: newHeight });
                  }
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  handleLogoMove(
                    logo.id, 
                    position,
                    { width: parseInt(ref.style.width), height: parseInt(ref.style.height) }
                  );
                }}
                ref={logoRefs.current.get(logo.id)}
                cancel=".logoControlButtons, .duplicateLogoButton, .removeLogoButton, .dragButton, .resizeButton"
                dragHandleClassName={styles.logoOverlay}
              >
              <div
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  position: "relative",
                  cursor: isLogoActive && draggable ? "move" : "pointer" 
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDragMode(logo.id);
                }}
                className={`${styles.logoOverlay} ${isLogoActive && isActive ? styles.active : ""}`}
              >
                {logo.type === 'text' ? (
                    <div 
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: logo.textStyle?.fontFamily || 'Arial',
                      fontSize: `${logo.textStyle?.fontSize || 24}px`,
                      fontWeight: logo.textStyle?.fontWeight || 'normal',
                      color: logo.textStyle?.color || '#000000',
                      pointerEvents: "none",
                      userSelect: "none",
                      whiteSpace: "pre-wrap",
                      textAlign: "center",
                      overflow: "hidden",
                      padding: "8px",
                      boxSizing: "border-box",
                      lineHeight: logo.text?.includes('\n') ? 1.3 : 'normal',
                      wordBreak: "break-word",
                      textOverflow: "ellipsis",
                      maxHeight: "100%"
                    }}
                  >
                    {logo.text || "Text"}
                  </div>
                ) : (
                  <img
                    src={logo.src}
                    alt={`Logo ${logo.id}`}
                    style={{ 
                      width: "100%", 
                      height: "100%",
                      pointerEvents: "none"
                    }}
                    draggable={false}
                  />
                )}
                
                {isLogoActive && isActive && (
                  <>
                    <div className={styles.customResizeHandle}>
                      <Image
                        src={resizeIcon}
                        alt="Resize Handle"
                        width={24}
                        height={24}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    
                    <button 
                      className={styles.removeLogoButton}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleLogoDelete(logo.id, e);
                      }}
                      style={{
                        position: "absolute",
                        top: "-15px",
                        left: "-15px",
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        borderRadius: "50%",
                        width: "26px",
                        height: "26px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#ff3b30",
                        fontWeight: "bold",
                        fontSize: "18px",
                        zIndex: 1002
                      }}
                      aria-label="Remove Logo"
                      title="Remove Logo"
                    >
                      &times;
                    </button>
                    
                    <button 
                      className={styles.duplicateLogoButton}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDuplicateLogo(logo.id, e);
                      }}
                      style={{
                        position: "absolute",
                        bottom: "-15px",
                        left: "-15px",
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        borderRadius: "50%",
                        width: "26px",
                        height: "26px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 1002
                      }}
                      aria-label="Duplicate Logo"
                      title="Duplicate Logo"
                    >
                      <Image
                        src={duplicateIcon}
                        alt="Duplicate"
                        width={20}
                        height={20}
                        style={{ objectFit: "contain" }}
                      />
                    </button>
                  </>
                )}
              </div>
            </Rnd>
          );
        })}
      </div>
    </div>
  );
};

export default DesignPage;