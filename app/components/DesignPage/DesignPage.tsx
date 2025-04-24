"use client";
import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import Sidebar from "../Sidebar/Sidebar";
import BagBlueprint from "../BagBlueprint/BagBlueprint";
import styles from "./DesignPage.module.css";
import resizeIcon from "../../public/resize.png";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const generatePDF = async () => {
    console.log("Starting PDF generation from DesignPage...");
    
    try {
      // Create a new jsPDF instance with landscape orientation
      const pdf = new jsPDF({
        orientation: "landscape", // Changed to landscape
        unit: "px",
        format: "a4"
      });
      
      // Function to safely convert an element to image
      const elementToImage = async (element: Element | null, fallbackText: string) => {
        if (!element) {
          console.warn(`${fallbackText} element not found`);
          return null;
        }
        
        try {
          // Use a higher scale for better quality
          const canvas = await html2canvas(element as HTMLElement, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null
          });
          return canvas.toDataURL('image/png');
        } catch (err) {
          console.error(`Failed to capture ${fallbackText}:`, err);
          return null;
        }
      };
      
      // First capture the entire design area
      console.log("Capturing design area...");
      const designArea = bagContainerRef.current;
      const designImage = await elementToImage(designArea, "Design area");
      
      // Try to capture the bag blueprint specifically
      console.log("Attempting to capture bag blueprint...");
      const bagBlueprintElement = document.querySelector(".bagBlueprint") || 
                                 document.querySelector("svg");
      const bagImage = bagBlueprintElement ? 
        await elementToImage(bagBlueprintElement, "Bag blueprint") : null;
      
      // Capture each logo individually
      const logoImages = [];
      
      for (const logo of logos) {
        const logoRef = logoRefs.current.get(logo.id);
        if (logoRef && logoRef.current) {
          const logoElement = logoRef.current.resizableElement.current;
          const logoImage = await elementToImage(logoElement, `Logo ${logo.id}`);
          
          if (logoImage) {
            logoImages.push({ id: logo.id, image: logoImage });
          }
        }
      }
      
      // Calculate page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add a title
      pdf.setFontSize(20);
      pdf.text("Your Bag Design", pageWidth / 2, 20, { align: "center" });
      
      // Add the design image (which contains both bag and all logos)
      if (designImage) {
        // Make the image take up most of the page
        // Leave margins of 20px on the sides and reserve space at the bottom for dimensions
        const imageWidth = pageWidth - 40;
        const imageHeight = pageHeight - 70; // Leave space for title and dimensions at bottom
        const imageX = 20;
        const imageY = 30;
        
        pdf.addImage(designImage, "PNG", imageX, imageY, imageWidth, imageHeight);
        console.log("Added complete design to PDF");
      }
      // If we couldn't get the full design but got individual components
      else if (bagImage) {
        // Make the bag blueprint take up most of the page
        const imageWidth = pageWidth * 0.65; // 65% of the page width
        const imageHeight = pageHeight - 70;
        const imageX = 20;
        const imageY = 30;
        
        pdf.addImage(bagImage, "PNG", imageX, imageY, imageWidth, imageHeight);
        console.log("Added bag blueprint to PDF");
        
        // Add logos separately if available
        if (logoImages.length > 0) {
          // Add logos section header
          pdf.setFontSize(14);
          pdf.text("Applied Logos:", imageWidth + 40, 40);
          
          // Determine how to layout multiple logos
          const logoWidth = 80;
          const logoHeight = 80;
          const logosPerColumn = Math.floor((pageHeight - 80) / (logoHeight + 20));
          
          logoImages.forEach((logoData, index) => {
            // Calculate position (vertical layout on right side)
            const col = Math.floor(index / logosPerColumn);
            const row = index % logosPerColumn;
            
            const x = imageWidth + 40 + (col * (logoWidth + 20));
            const y = 60 + (row * (logoHeight + 20));
            
            // Add logo with number label
            pdf.addImage(logoData.image, "PNG", x, y, logoWidth, logoHeight);
            pdf.setFontSize(10);
            pdf.text(`Logo ${index + 1}`, x, y - 5);
          });
        }
      } 
      else {
        pdf.setFontSize(12);
        pdf.text("(Could not capture bag design)", pageWidth / 2, pageHeight / 2, { align: "center" });
        console.log("No design elements captured");
      }
      
      // Add dimensions information at the bottom
      const lengthInches = (dimensions.length / 25.4).toFixed(2);
      const widthInches = (dimensions.width / 25.4).toFixed(2);
      const heightInches = (dimensions.height / 25.4).toFixed(2);
      
      // Create a compact dimensions section at the bottom
      pdf.setFillColor(245, 245, 245);
      pdf.rect(20, pageHeight - 30, pageWidth - 40, 20, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const dimensionsText = `Bag Dimensions: Length: ${lengthInches}" x Width: ${widthInches}" x Height: ${heightInches}"`;
      pdf.text(dimensionsText, pageWidth / 2, pageHeight - 18, { align: "center" });
      
      // Add a footer with date
      const today = new Date().toLocaleDateString();
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${today} - MTC Bags`, pageWidth - 20, pageHeight - 5, { align: "right" });
      
      // Save the PDF
      console.log("Saving PDF...");
      pdf.save("MTC-Bag-Design.pdf");
      
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