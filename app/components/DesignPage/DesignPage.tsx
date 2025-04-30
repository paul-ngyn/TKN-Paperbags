"use client";
import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import Sidebar from "../Sidebar/Sidebar";
import BagBlueprint from "../BagBlueprint/BagBlueprint";
import styles from "./DesignPage.module.css";
import resizeIcon from "../../public/resize.png";
import Image from "next/image";
import jsPDF from "jspdf";
import {svg2pdf} from "svg2pdf.js";

interface DesignPageProps {
  handleNavigation: (page: string) => void;
}

// Define the BagDimensions interface
interface BagDimensions {
  length: number;
  width: number;
  height: number;
}

interface Logo {
  id: string;
  src: string;
  position: { x: number, y: number };
  size: { width: number, height: number };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DesignPage: React.FC<DesignPageProps> = ({ handleNavigation }) => {
  // Change to array of Logo objects
  const [logos, setLogos] = useState<Logo[]>([]);
  const [activeLogoId, setActiveLogoId] = useState<string | null>(null);
  const [draggable, setDraggable] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoRefs = useRef<Map<string, React.RefObject<Rnd>>>(new Map());
  const bagContainerRef = useRef<HTMLDivElement>(null);
  
  // Add state for bag dimensions
  const [dimensions, setDimensions] = useState<BagDimensions>({
    length: 310,
    width: 155,
    height: 428
  });
  
  // Add state to track if dimensions are being edited
  const [isEditingDimensions, setIsEditingDimensions] = useState(false);
  
  // Generate PDF function
  // Update the generatePDF function to preserve logo positions

const generatePDF = async () => {
  console.log("Starting PDF generation with preserved logo positioning...");
  
  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: "a4",
      compress: false // Important for keeping vector quality
    });
    
    // Calculate page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add a title
    pdf.setFontSize(20);
    pdf.text("Your Bag Design", pageWidth / 2, 20, { align: "center" });
    
    // Get the bag blueprint SVG
    const bagBlueprintElement = document.querySelector(".bagBlueprint") || 
                               document.querySelector("svg");
    
    if (bagBlueprintElement instanceof SVGElement) {
      // Clone the SVG to avoid modifications to the original
      const svgClone = bagBlueprintElement.cloneNode(true) as SVGElement;
      
      // Get the dimensions of the container and SVG for calculations
      const bagContainerRect = bagContainerRef.current?.getBoundingClientRect() || 
                              { width: 0, height: 0, left: 0, top: 0 };
      const svgRect = bagBlueprintElement.getBoundingClientRect();
      const svgAspect = svgRect.width / svgRect.height;
      
      // Calculate dimensions that fit on page
      let svgWidth = pageWidth * 0.9; // 90% of page width
      let svgHeight = svgWidth / svgAspect;
      
      if (svgHeight > pageHeight * 0.75) { // If too tall
        svgHeight = pageHeight * 0.75;
        svgWidth = svgHeight * svgAspect;
      }
      
      // Calculate the positioning and scaling for the PDF
      const xPos = (pageWidth - svgWidth) / 2; // Center horizontally
      const yPos = 50; // Position below title
      
      // Scale factor to map container coordinates to PDF coordinates
      const scaleX = svgWidth / bagContainerRect.width;
      const scaleY = svgHeight / bagContainerRect.height;
      
      // Add SVG as vector (this is the key part)
      await svg2pdf(svgClone, pdf, {
        x: xPos,
        y: yPos,
        width: svgWidth,
        height: svgHeight
      });
      
      console.log("Added bag blueprint as vector SVG");
      
      // Add logos at their relative positions on the bag
      if (logos.length > 0) {
        for (const logo of logos) {
          try {
            // Calculate logo position relative to the PDF canvas
            // This translates from container coordinates to PDF coordinates
            const pdfLogoX = xPos + (logo.position.x * scaleX);
            const pdfLogoY = yPos + (logo.position.y * scaleY);
            
            // Calculate scaled size
            const pdfLogoWidth = logo.size.width * scaleX;
            const pdfLogoHeight = logo.size.height * scaleY;
            
            if (logo.src.startsWith('data:image/svg+xml')) {
              // Handle SVG logos - add as vector for selectability
              const svgString = atob(logo.src.split(',')[1]);
              const parser = new DOMParser();
              const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
              
              if (svgDoc.documentElement) {
                // Add SVG logo while preserving its position
                await svg2pdf(svgDoc.documentElement, pdf, {
                  x: pdfLogoX,
                  y: pdfLogoY,
                  width: pdfLogoWidth,
                  height: pdfLogoHeight
                });
              } else {
                // Fallback to raster if parsing fails
                pdf.addImage(
                  logo.src, 
                  'PNG', 
                  pdfLogoX, 
                  pdfLogoY, 
                  pdfLogoWidth, 
                  pdfLogoHeight
                );
              }
            } else {
              // Regular image - add as raster
              pdf.addImage(
                logo.src, 
                'PNG', 
                pdfLogoX, 
                pdfLogoY, 
                pdfLogoWidth, 
                pdfLogoHeight
              );
            }
            
            console.log(`Added logo at position: (${pdfLogoX}, ${pdfLogoY})`);
          } catch (err) {
            console.error(`Failed to add logo ${logo.id}:`, err);
          }
        }
      }
      
    } else {
      console.warn("SVG element not found, falling back to raster image");
      // Fallback to raster if needed - implement if required
    }
    
    // Add dimensions and footer as before
    const lengthInches = (dimensions.length / 25.4).toFixed(2);
    const widthInches = (dimensions.width / 25.4).toFixed(2);
    const heightInches = (dimensions.height / 25.4).toFixed(2);
    
    pdf.setFillColor(245, 245, 245);
    pdf.rect(20, pageHeight - 30, pageWidth - 40, 20, 'F');
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const dimensionsText = `Bag Dimensions: Length: ${lengthInches}" × Width: ${widthInches}" × Height: ${heightInches}"`;
    pdf.text(dimensionsText, pageWidth / 2, pageHeight - 18, { align: "center" });
    
    const today = new Date().toLocaleDateString();
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on ${today} - MTC Bags`, pageWidth - 20, pageHeight - 5, { align: "right" });
    
    // Save the PDF
    pdf.save("MTC-Bag-Design-Editable.pdf");
    
    console.log("PDF generation complete!");
    return true;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    alert("Sorry, we couldn't generate your PDF. Please try again or contact support.");
    return false;
  }
};
  
  const handleLogoUpload = (files: FileList) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          const newLogo: Logo = {
            id: `logo-${Date.now()}`,
            src: e.target.result,
            position: { x: 50, y: 50 }, // Default position
            size: { width: 150, height: 150 } // Default size
          };
          
          // Create a new ref for this logo
          logoRefs.current.set(newLogo.id, React.createRef<Rnd>());
          
          // Add the new logo to the array
          setLogos(prev => [...prev, newLogo]);
          // Make it the active logo
          setActiveLogoId(newLogo.id);
          setDraggable(true);
          setIsActive(true);
        }
      };
      reader.readAsDataURL(file);
      
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    // Clear all logos
    setLogos([]);
    logoRefs.current = new Map();
    setActiveLogoId(null);
    setDraggable(false);
    setIsActive(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogoDelete = (logoId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    // Remove specific logo
    setLogos(prev => prev.filter(logo => logo.id !== logoId));
    // Clear the ref
    logoRefs.current.delete(logoId);
    
    // Reset active logo if needed
    if (activeLogoId === logoId) {
      setActiveLogoId(null);
      setDraggable(false);
      setIsActive(false);
    }
  };

  // Add new duplicate logo function
  const handleDuplicateLogo = (logoId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    // Find the logo to duplicate
    const logoToDuplicate = logos.find(logo => logo.id === logoId);
    
    if (logoToDuplicate) {
      // Create a new logo with the same image but slightly offset position
      const newLogo: Logo = {
        id: `logo-${Date.now()}`, // New unique ID
        src: logoToDuplicate.src,
        position: { 
          x: logoToDuplicate.position.x + 20, 
          y: logoToDuplicate.position.y + 20 
        },
        size: { ...logoToDuplicate.size }
      };
      
      // Create a new ref for the duplicated logo
      logoRefs.current.set(newLogo.id, React.createRef<Rnd>());
      
      // Add the new logo to the array
      setLogos(prev => [...prev, newLogo]);
      
      // Make it the active logo
      setActiveLogoId(newLogo.id);
      setDraggable(true);
      setIsActive(true);
    }
  };

  const toggleDragMode = (logoId: string) => {
    // If it's already active, no need to change anything
    if (activeLogoId === logoId && draggable) return;
    
    // Deactivate any previously active logo
    setActiveLogoId(logoId);
    setDraggable(true);
    setIsActive(true);
  };

  const disableDrag = () => {
    setDraggable(false);
    setIsActive(false);
  };
  
  // Update logo position and size when moved or resized
  const handleLogoMove = (logoId: string, position: {x: number, y: number}, size?: {width: number, height: number}) => {
    setLogos(prev => prev.map(logo => {
      if (logo.id === logoId) {
        return {
          ...logo,
          position: position,
          size: size || logo.size
        };
      }
      return logo;
    }));
  };
  
  // Start editing dimensions
  const startEditingDimensions = () => {
    setIsEditingDimensions(true);
  };
    
  // Confirm dimension changes
  const handleDimensionChange = (newDimensions: BagDimensions) => {
    setDimensions(newDimensions);
    setIsEditingDimensions(false);
  };
  
  // Handle clicking outside any logo (in the bag area)
  const handleBagClick = (e: React.MouseEvent) => {
    // Only handle the click if it's directly on the bag container (not on a logo)
    if (e.currentTarget === e.target) {
      setActiveLogoId(null);
      setDraggable(false);
      setIsActive(false);
    }
  };
  
  return (
    <div className={styles.pageContainer}>
      <Sidebar
        handleLogoUpload={handleLogoUpload}
        handleClear={handleClear}
        fileInputRef={fileInputRef}
        dimensions={dimensions}
        handleDimensionChange={handleDimensionChange}
        startEditingDimensions={startEditingDimensions}
        downloadDesign={generatePDF}
        logoCount={logos.length}
      />
      
      <div 
        className={styles.bagContainer} 
        ref={bagContainerRef}
        onClick={handleBagClick}
      >
        <BagBlueprint 
          dimensions={dimensions} 
          isEditing={isEditingDimensions}
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
              enableResizing={isLogoActive && draggable ? { 
                bottomRight: true, 
              } : false}
              onDragStop={(e, d) => {
                handleLogoMove(logo.id, {x: d.x, y: d.y});
                disableDrag();
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                handleLogoMove(
                  logo.id, 
                  position,
                  { width: parseInt(ref.style.width), height: parseInt(ref.style.height) }
                );
                disableDrag();
              }}
              ref={logoRefs.current.get(logo.id)}
            >
              <div
                style={{ width: "100%", height: "100%", position: "relative" }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDragMode(logo.id);
                }}
                className={`${styles.logoOverlay} ${isLogoActive && isActive ? styles.active : ""}`}
              >
                <img
                  src={logo.src}
                  alt={`Logo ${logo.id}`}
                  style={{ width: "100%", height: "100%" }}
                />
                {isLogoActive && isActive && (
                  <>
                    <div className={styles.customResizeHandle}>
                      <Image
                        src={resizeIcon}
                        alt="Resize Handle"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                    <div className={styles.logoControlButtons}>
                      <button 
                        className={styles.duplicateLogoButton}
                        onClick={(e) => handleDuplicateLogo(logo.id, e)}
                        aria-label="Duplicate Logo"
                        title="Duplicate Logo"
                      >
                        <span role="img" aria-label="duplicate">📋</span>
                      </button>
                      <button 
                        className={styles.removeLogoButton}
                        onClick={(e) => handleLogoDelete(logo.id, e)}
                        aria-label="Remove Logo"
                        title="Remove Logo"
                      >
                        &times;
                      </button>
                    </div>
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