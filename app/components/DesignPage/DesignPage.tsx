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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DesignPage: React.FC<DesignPageProps> = ({ handleNavigation }) => {
  // Change to array of Logo objects
  const [logos, setLogos] = useState<Logo[]>([]);
  const [activeLogoId, setActiveLogoId] = useState<string | null>(null);
  const [draggable, setDraggable] = useState(false);
  const [isActive, setIsActive] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDragging, setIsDragging] = useState(false);
  
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
              const logoXInPDF = logoOriginX + (logo.position.x * scaleX);
              const logoYInPDF = logoOriginY + (logo.position.y * scaleY);
              const logoWidthInPDF = logo.size.width * scaleX;
              const logoHeightInPDF = logo.size.height * scaleY;
              
              // Process based on logo type
              if (logo.type === 'text' && logo.text) {
                // Handle text elements in PDF
                const fontFamily = logo.textStyle?.fontFamily || 'helvetica';
                // Map font names to jsPDF standard fonts
                const pdfFontName = 
                  fontFamily.toLowerCase().includes('times') ? 'times' : 
                  fontFamily.toLowerCase().includes('courier') ? 'courier' : 'helvetica';
                
                // Set font style based on weight
                const fontStyle = logo.textStyle?.fontWeight === 'bold' ? 'bold' : 'normal';
                pdf.setFont(pdfFontName, fontStyle);
                
                // Calculate font size proportionally to the element size
                const scaledFontSize = (logo.textStyle?.fontSize || 24) * 
                  Math.min(scaleX, scaleY) * 0.8; // Scale down slightly to ensure text fits
                pdf.setFontSize(scaledFontSize);
                
                // Set text color (convert hex to RGB components)
                const color = logo.textStyle?.color || '#000000';
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                pdf.setTextColor(r, g, b);
                
                // Position text in the center of the element
                const textX = logoXInPDF + logoWidthInPDF / 2;
                const textY = logoYInPDF + logoHeightInPDF / 2;
                
                // Add text to PDF with alignment options
                pdf.text(logo.text, textX, textY, { 
                  align: 'center',
                  baseline: 'middle'
                });
                
                console.log(`Text ${logo.id} added at position:`, {
                  screen: { x: logo.position.x, y: logo.position.y },
                  pdf: { x: logoXInPDF.toFixed(2), y: logoYInPDF.toFixed(2) },
                  pdf_size: { w: logoWidthInPDF.toFixed(2), h: logoHeightInPDF.toFixed(2) },
                  fontSize: scaledFontSize.toFixed(2),
                  text: logo.text
                });
              } else if (logo.type === 'image' && logo.src) {
                // Handle image elements
                console.log(`Logo ${logo.id} position:`, {
                  screen: { x: logo.position.x, y: logo.position.y },
                  pdf: { x: logoXInPDF.toFixed(2), y: logoYInPDF.toFixed(2) },
                  pdf_size: { w: logoWidthInPDF.toFixed(2), h: logoHeightInPDF.toFixed(2) }
                });
                
                pdf.addImage(logo.src, 'PNG', logoXInPDF, logoYInPDF, logoWidthInPDF, logoHeightInPDF);
              } else {
                console.warn(`Skipping logo ${logo.id} - invalid type or missing content`);
              }
            } catch (err) {
              console.error(`Failed to add logo/text ${logo.id}:`, err);
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
            type: 'image',
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

  // Add text element to the design
  const handleAddText = (text?: string, style?: TextStyle) => {
    // Default text and style if not provided
    const textContent = text || "Your text here";
    const textStyle = style || {
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#000000',
      fontWeight: 'normal'
    };
    
    // Create new text element
    const newTextLogo: Logo = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: textContent,
      textStyle: textStyle,
      position: { x: 50, y: 50 },
      size: { width: 200, height: 60 }
    };
    
    // Create a ref for this element
    logoRefs.current.set(newTextLogo.id, React.createRef<Rnd>());
    
    // Add to logos array
    setLogos(prev => [...prev, newTextLogo]);
    
    // Make it active
    setActiveLogoId(newTextLogo.id);
    setDraggable(true);
    setIsActive(true);
  };
  
  // Update text content and styling
  const updateTextContent = (id: string, text: string, style: TextStyle) => {
    setLogos(prev => prev.map(logo => {
      if (logo.id === id) {
        return {
          ...logo,
          text: text,
          textStyle: style
        };
      }
      return logo;
    }));
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
      // Create a new logo with the same properties but slightly offset position
      const newLogo: Logo = {
        id: `${logoToDuplicate.type}-${Date.now()}`, // New unique ID
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
    // Always make the logo active when clicked
    setActiveLogoId(logoId);
    setIsActive(true);
    
    // If it wasn't already active and draggable, enable dragging
    if (activeLogoId !== logoId || !draggable) {
      setDraggable(true);
    }
  };
  
  // Modify to keep drag mode active
  const disableDrag = () => {
    // Don't disable dragging right away
    // Instead keep it enabled while the logo is active
    setIsDragging(false);
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
              onDragStart={() => {
                setIsDragging(true);
              }}
              // Use onDrag for live updates instead of just onDragStop
              onDrag={(e, d) => {
                // Update position in real-time during dragging
                handleLogoMove(logo.id, {x: d.x, y: d.y});
              }}
              onDragStop={(e, d) => {
                handleLogoMove(logo.id, {x: d.x, y: d.y});
                disableDrag();
              }}
              // Also update in real-time during resizing
              onResize={(e, direction, ref, delta, position) => {
                handleLogoMove(
                  logo.id, 
                  position,
                  { width: parseInt(ref.style.width), height: parseInt(ref.style.height) }
                );
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
              cancel=".logoControlButtons, .duplicateLogoButton, .removeLogoButton, .dragButton, .resizeButton"
              // Set this to make dragging more responsive
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
                      wordBreak: "break-word",
                      textAlign: "center",
                      overflow: "hidden",
                      padding: "5px"
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
                      pointerEvents: "none" // This prevents the image from interfering with drag
                    }}
                    draggable={false} // Prevent browser's native drag
                  />
                )}
                
                {isLogoActive && isActive && (
                  <>
                    {/* Resize handle at bottom-right */}
                    <div className={styles.customResizeHandle}>
                      <Image
                        src={resizeIcon}
                        alt="Resize Handle"
                        width={24}
                        height={22}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    
                    {/* Delete button - positioned at top-left */}
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
                    
                    {/* Duplicate button - positioned at bottom-left */}
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