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
import { BagDimensions, calculateBagDimensions, calculatePDFDimensions, calculateLogoPositions } from "../../util/BagDimensions";

interface DesignPageProps {
  handleNavigation: (page: string) => void;
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
  
  // Generate PDF function - updated to use the utility calculator
  const generatePDF = async () => {
    console.log("Starting PDF generation with accurate physical dimensions...");
    
    try {
      // Use the BagDimensions utility for calculations
      const calculatedDim = calculateBagDimensions(dimensions);
      
      console.log("Bag dimensions (mm):", {
        length: dimensions.length,
        width: dimensions.width,
        height: dimensions.height
      });
      
      console.log("Calculated dimensions:", {
        totalWidthMM: calculatedDim.totalWidthMM,
        totalHeightMM: calculatedDim.totalHeightMM,
        totalWidthInches: calculatedDim.totalWidthInches.toFixed(2),
        totalHeightInches: calculatedDim.totalHeightInches.toFixed(2)
      });
      
      // Calculate PDF dimensions with LARGER margins
      const pdfDimensions = calculatePDFDimensions(calculatedDim, 3); // 3-inch margin
      
      // Create a new jsPDF instance with size based on the actual bag dimensions plus margins
      const pdf = new jsPDF({
        orientation: pdfDimensions.orientation,
        unit: "in",
        format: [pdfDimensions.pdfWidthInches, pdfDimensions.pdfHeightInches],
        compress: false, // Keep vector quality
        hotfixes: ["scale_correction"] // Add this to help with scaling issues
      });
      
      // Calculate page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      console.log("PDF dimensions:", {
        width: pdfDimensions.pdfWidthInches,
        height: pdfDimensions.pdfHeightInches,
        orientation: pdfDimensions.orientation,
        pageWidth,
        pageHeight
      });
      
      // Get the bag blueprint SVG
      const bagBlueprintElement = document.querySelector(".bagBlueprint") || 
                                document.querySelector("svg");
      
      if (bagBlueprintElement instanceof SVGElement) {
        // Clone the SVG to avoid modifications to the original
        const svgClone = bagBlueprintElement.cloneNode(true) as SVGElement;
        
        // Set explicit dimensions with some padding
        const viewBoxWidth = calculatedDim.totalWidthMM * 1.35; // 35% extra width currently these lines are affecting precise measurements and viewing
        const viewBoxHeight = calculatedDim.totalHeightMM * 1.35; // 35% extra height
        
        svgClone.setAttribute('width', `${calculatedDim.totalWidthMM}mm`);
        svgClone.setAttribute('height', `${calculatedDim.totalHeightMM}mm`);
        svgClone.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
        svgClone.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        // Position the bag in the available space using values from the utility
        const xPos = pdfDimensions.xPos;
        const yPos = pdfDimensions.yPos;
        
        console.log("SVG placement:", {
          x: xPos,
          y: yPos,
          width: calculatedDim.totalWidthInches,
          height: calculatedDim.totalHeightInches
        });
        
        
        // Add SVG as vector with exact physical dimensions (1:1 scale)
        await svg2pdf(svgClone, pdf, {
          x: xPos,
          y: yPos,
          width: calculatedDim.totalWidthInches,
          height: calculatedDim.totalHeightInches
        });
        
        
        console.log(`Added bag blueprint at exact size: ${calculatedDim.totalWidthInches.toFixed(2)}×${calculatedDim.totalHeightInches.toFixed(2)} inches`);
        
        // Get container dimensions for logo positioning
        const bagContainerRect = bagContainerRef.current?.getBoundingClientRect() || 
                               { width: 0, height: 0 };
        
        // Calculate logo positions using the utility function
        const logoPositions = calculateLogoPositions(
          bagContainerRect, 
          calculatedDim,
          xPos,
          yPos
        );
        
        // Add logos at their correct physical positions
        if (logos.length > 0) {
          console.log("Adding logos with following scale factors:", {
            scaleX: logoPositions.scaleX,
            scaleY: logoPositions.scaleY
          });
          
          for (const logo of logos) {
            try {
              // Convert screen positions to physical positions
              const logoXInPDF = logoPositions.xPos + (logo.position.x * logoPositions.scaleX);
              const logoYInPDF = logoPositions.yPos + (logo.position.y * logoPositions.scaleY);
              const logoWidthInPDF = logo.size.width * logoPositions.scaleX;
              const logoHeightInPDF = logo.size.height * logoPositions.scaleY;
              
              console.log(`Logo ${logo.id} position:`, {
                screen: { x: logo.position.x, y: logo.position.y },
                pdf: { x: logoXInPDF, y: logoYInPDF }
              });
              
              // Add the logo to PDF
              pdf.addImage(
                logo.src, 
                'PNG', 
                logoXInPDF, 
                logoYInPDF, 
                logoWidthInPDF, 
                logoHeightInPDF
              );
            } catch (err) {
              console.error(`Failed to add logo ${logo.id}:`, err);
            }
          }
        }
        
        // Add dimensions text to the bottom of the PDF
        // Use formatted values from the calculator for consistency
        const dimensionsText = `Bag Dimensions: Length: ${calculatedDim.formattedLength} × Width: ${calculatedDim.formattedWidth} × Height: ${calculatedDim.formattedHeight}`;
        pdf.text(dimensionsText, pageWidth / 2, pageHeight - 0.7, { align: "center" });
        
        // Additional info for total unfolded size
        const unfoldedSizeText = `Total unfolded size: ${calculatedDim.formattedTotalWidth} × ${calculatedDim.formattedTotalHeight}`;
        pdf.text(unfoldedSizeText, pageWidth / 2, pageHeight - 0.4, { align: "center" });
        
        // Save the PDF with exact dimensions in the filename
        pdf.save(`MTC-Bag-Design-${calculatedDim.totalWidthInches.toFixed(2)}x${calculatedDim.totalHeightInches.toFixed(2)}-inches.pdf`);
        
        console.log("Physical-size PDF generation complete with exact 1:1 scaling!");
        return true;
      }
      
      console.warn("SVG element not found");
      return false;
      
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Sorry, we couldn't generate your PDF. Please try again.");
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