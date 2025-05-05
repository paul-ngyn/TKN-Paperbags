"use client";
import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import Sidebar from "../Sidebar/Sidebar";
import BagBlueprint from "../BagBlueprint/BagBlueprint";
import styles from "./DesignPage.module.css";
import resizeIcon from "../../public/resize.png";
import Image from "next/image";
import jsPDF from "jspdf";
import {svg2pdf} from "svg2pdf.js";
import { BagDimensions, calculateBagDimensions } from "../../util/BagDimensions";

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
      
      // ... console logs for dimensions ...

      // --- PDF Page Size Calculation (Revised) ---
      // Temporarily get the SVG element to read its final viewBox for sizing
      // Note: This assumes the SVG is already rendered in the DOM. If not, this needs adjustment.
      const tempSvgElement = document.querySelector(".bagBlueprint svg") || document.querySelector("svg");
      let svgViewBoxWidth = calculatedDim.totalWidthMM + 150; // Estimate default if not found
      let svgViewBoxHeight = calculatedDim.totalHeightMM + 150; // Estimate default if not found
      if (tempSvgElement instanceof SVGElement) {
          const tempViewBox = tempSvgElement.getAttribute('viewBox');
          const tempViewBoxValues = tempViewBox ? tempViewBox.split(' ').map(Number) : [0, 0, svgViewBoxWidth, svgViewBoxHeight];
          svgViewBoxWidth = tempViewBoxValues[2];
          svgViewBoxHeight = tempViewBoxValues[3];
      }
      
      // Calculate the required physical size in INCHES based on the SVG's viewBox width/height
      // Assuming the viewBox coordinates correspond roughly to millimeters
      const MM_TO_INCHES = 1 / 25.4;
      const requiredBlueprintWidthInches = svgViewBoxWidth * MM_TO_INCHES;
      const requiredBlueprintHeightInches = svgViewBoxHeight * MM_TO_INCHES;
      
      const marginInches = 2; // Keep 2-inch margin
      
      // Calculate PDF page size needed to contain the *entire viewBox* plus margins
      const pdfWidthInches = Math.ceil(requiredBlueprintWidthInches + (marginInches * 2));
      const pdfHeightInches = Math.ceil(requiredBlueprintHeightInches + (marginInches * 2));
      const pdfOrientation = pdfWidthInches > pdfHeightInches ? "landscape" as const : "portrait" as const;

      // Calculate position to center the blueprint (based on its full viewBox size)
      const xPos = (pdfWidthInches - requiredBlueprintWidthInches) / 2;
      const yPos = (pdfHeightInches - requiredBlueprintHeightInches) / 2;
      // --- End Revised PDF Page Size Calculation ---

      // Create a new jsPDF instance with the calculated size
      const pdf = new jsPDF({
        orientation: pdfOrientation,
        unit: "in",
        format: [pdfWidthInches, pdfHeightInches], // Use newly calculated page size
        compress: false, 
        hotfixes: ["scale_correction"] 
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      console.log("Revised PDF dimensions:", {
        width: pdfWidthInches,
        height: pdfHeightInches,
        orientation: pdfOrientation,
        pageWidth,
        pageHeight,
        requiredBlueprintWidthInches: requiredBlueprintWidthInches.toFixed(2),
        requiredBlueprintHeightInches: requiredBlueprintHeightInches.toFixed(2),
        xPos: xPos.toFixed(2),
        yPos: yPos.toFixed(2)
      });
      
      // Get the bag blueprint SVG element again for cloning
      const bagBlueprintElement = document.querySelector(".bagBlueprint svg") || document.querySelector("svg");

      if (bagBlueprintElement instanceof SVGElement) {
        // Clone the SVG
        const svgClone = bagBlueprintElement.cloneNode(true) as SVGElement;
        
        // Ensure the viewBox attribute is present (it should be from BagBlueprint)
        const finalViewBox = svgClone.getAttribute('viewBox');
        if (!finalViewBox) {
            console.warn("SVG clone is missing viewBox attribute!");
            // Optionally set a fallback based on tempViewBoxValues if needed
        } else {
             console.log("Using SVG viewBox for scaling:", finalViewBox);
        }
        
        // Ensure preserveAspectRatio is set
        svgClone.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        // --- Use the physical dimensions of the ENTIRE viewBox ---
        await svg2pdf(svgClone, pdf, {
          x: xPos, // Use centering position based on full viewBox
          y: yPos, // Use centering position based on full viewBox
          width: requiredBlueprintWidthInches,  // Target physical width for the whole viewBox
          height: requiredBlueprintHeightInches // Target physical height for the whole viewBox
        });
                      
        console.log(`Added bag blueprint. Target physical size for SVG content: ${requiredBlueprintWidthInches.toFixed(2)}×${requiredBlueprintHeightInches.toFixed(2)} inches`);
        
        // --- Logo Positioning Needs Adjustment ---
        // The scale factor now needs to relate screen pixels to the physical size 
        // of the SVG container *within the PDF*.
        const bagContainerRect = bagContainerRef.current?.getBoundingClientRect() || { width: 0, height: 0 };
        
        // Scale factor: inches_in_pdf / pixels_on_screen
        // The blueprint SVG now occupies requiredBlueprintWidthInches x requiredBlueprintHeightInches in the PDF
        const scaleX = requiredBlueprintWidthInches / bagContainerRect.width;
        const scaleY = requiredBlueprintHeightInches / bagContainerRect.height;
        
        // The logo's (0,0) origin relative to the PDF page is xPos, yPos
        const logoOriginX = xPos;
        const logoOriginY = yPos;
        
        // Add logos at their correct physical positions relative to the scaled blueprint
        if (logos.length > 0) {
          console.log("Adding logos with following scale factors:", { scaleX, scaleY });
          
          for (const logo of logos) {
            try {
              // Convert screen pixel position (relative to container) to PDF inch position
              // Need to map the logo's position within the SVG's coordinate system first, then scale.
              // This part is tricky. Let's assume logo.position is relative to the top-left of the bagContainerRef
              // We need to map this to the SVG's internal coordinate system, then to PDF inches.
              
              // Simpler approach: Map directly from screen container pixels to PDF inches
              const logoXInPDF = logoOriginX + (logo.position.x * scaleX);
              const logoYInPDF = logoOriginY + (logo.position.y * scaleY);
              const logoWidthInPDF = logo.size.width * scaleX;
              const logoHeightInPDF = logo.size.height * scaleY;
              
              console.log(`Logo ${logo.id} position:`, {
                screen: { x: logo.position.x, y: logo.position.y },
                pdf: { x: logoXInPDF.toFixed(2), y: logoYInPDF.toFixed(2) },
                pdf_size: { w: logoWidthInPDF.toFixed(2), h: logoHeightInPDF.toFixed(2) }
              });
              
              pdf.addImage(logo.src, 'PNG', logoXInPDF, logoYInPDF, logoWidthInPDF, logoHeightInPDF);
            } catch (err) {
              console.error(`Failed to add logo ${logo.id}:`, err);
            }
          }
        }
        
        // Save the PDF
        pdf.save(`MTC-Bag-Design-${calculatedDim.totalWidthInches.toFixed(2)}x${calculatedDim.totalHeightInches.toFixed(2)}-inches_Physical.pdf`);
        
        console.log("Physical-size PDF generation complete. Check scale in CorelDraw.");
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
            <Draggable
              key={logo.id}
              position={{x: logo.position.x, y: logo.position.y}}
              disabled={!(isLogoActive && draggable)}
              bounds="parent"
              onStop={(e, data) => {
                handleLogoMove(logo.id, {x: data.x, y: data.y});
                disableDrag();
              }}
              handle=".dragHandle" // This enables drag only on elements with this class
            >
              <div style={{position: 'absolute'}}>
                <ResizableBox
                  width={logo.size.width}
                  height={logo.size.height}
                  minConstraints={[50, 50]}
                  maxConstraints={[500, 500]}
                  resizeHandles={isLogoActive && draggable ? ['se'] : []} 
                  onResizeStop={(e, data) => {
                    const { width, height } = data.size;
                    handleLogoMove(
                      logo.id,
                      { x: logo.position.x, y: logo.position.y },
                      { width, height }
                    );
                    disableDrag();
                  }}
                >
                  <div
                    style={{ width: '100%', height: '100%', position: 'relative' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDragMode(logo.id);
                    }}
                    className={`${styles.logoOverlay} ${isLogoActive && isActive ? styles.active : ""}`}
                  >
                    <img
                      src={logo.src}
                      alt={`Logo ${logo.id}`}
                      style={{ width: '100%', height: '100%' }}
                    />
                    {isLogoActive && isActive && (
                      <>
                        <div className={styles.resizeHandle}></div>
                        <div className={`${styles.dragHandleButton} dragHandle`}>
                          <span role="img" aria-label="drag">↔</span>
                        </div>
                        <div className={styles.logoControlButtons}>
                          <button 
                            className={styles.duplicateLogoButton}
                            onClick={(e) => handleDuplicateLogo(logo.id, e)}
                          >
                            <span role="img" aria-label="duplicate">📋</span>
                          </button>
                          <button 
                            className={styles.removeLogoButton}
                            onClick={(e) => handleLogoDelete(logo.id, e)}
                          >
                            &times;
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </ResizableBox>
              </div>
            </Draggable>
          );
        })}
      </div>
    </div>
  );
};

export default DesignPage;