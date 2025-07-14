import jsPDF from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import { BagDimensions, calculateBagDimensions } from "../util/BagDimensions";
// 1. Import the Logo and TextStyle types from their single source of truth
import { Logo } from '../components/LogoItem/LogoItem';

// 2. Remove the local, outdated interface definitions

interface TextOptions {
  align: 'left' | 'center' | 'right';
  baseline: 'top' | 'middle' | 'bottom';
  angle?: number;
}

export const generatePDF = async (
  dimensions: BagDimensions,
  // 3. This now uses the correct, imported Logo type
  logos: Logo[],
  bagContainerRef: React.RefObject<HTMLDivElement>
) => {
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
          
          // 4. Process based on logo type, now including 'pdf'
          if (logo.type === 'text' && logo.text) {
            addTextToPdf(pdf, logo, logoXInPDF, logoYInPDF, logoWidthInPDF, logoHeightInPDF, scaleX, scaleY);
          } else if (logo.type === 'image' && logo.src) {
            pdf.addImage(logo.src, 'PNG', logoXInPDF, logoYInPDF, logoWidthInPDF, logoHeightInPDF);
          } else if (logo.type === 'pdf') {
            // Draw a placeholder for the PDF logo
            pdf.setDrawColor(204, 204, 204); // light grey border
            pdf.setFillColor(247, 247, 247); // very light grey fill
            pdf.rect(logoXInPDF, logoYInPDF, logoWidthInPDF, logoHeightInPDF, 'FD'); // Fill and Draw

            // Add text to the placeholder
            pdf.setFontSize(10);
            pdf.setTextColor(231, 76, 60); // red-ish color for "PDF"
            pdf.text('PDF Logo', logoXInPDF + logoWidthInPDF / 2, logoYInPDF + logoHeightInPDF / 2 - 0.05, { align: 'center' });

            if (logo.fileName) {
                pdf.setFontSize(8);
                pdf.setTextColor(85, 85, 85); // dark grey for filename
                const shortFileName = logo.fileName.length > 25 ? logo.fileName.substring(0, 22) + '...' : logo.fileName;
                pdf.text(shortFileName, logoXInPDF + logoWidthInPDF / 2, logoYInPDF + logoHeightInPDF / 2 + 0.1, { align: 'center' });
            }
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
    
    // Get rotation value from logo
    const rotation = (logo.type === 'text' && logo.textStyle?.rotation !== undefined)
      ? logo.textStyle.rotation
      : (logo.rotation ?? 0);
    
    // Calculate expanded canvas size to accommodate rotation
    let canvasWidth = logo.size.width;
    let canvasHeight = logo.size.height;
    
    if (rotation !== 0) {
      // Calculate the bounding box after rotation
      const radians = (Math.abs(rotation) * Math.PI) / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      
      // Expand canvas to fit rotated content
      canvasWidth = Math.ceil(logo.size.width * cos + logo.size.height * sin);
      canvasHeight = Math.ceil(logo.size.width * sin + logo.size.height * cos);
    }
    
    // Set canvas properties - higher ratio for better quality
    const pixelRatio = 5;
    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Apply rotation transformation if needed
    if (rotation !== 0) {
      // Save the current transformation matrix
      ctx.save();
      
      // Move to center of expanded canvas, apply rotation
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Translate back by original dimensions center
      ctx.translate(-logo.size.width / 2, -logo.size.height / 2);
    }
    
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
    
    // Restore the transformation matrix if rotation was applied
    if (rotation !== 0) {
      ctx.restore();
    }
    
    // Convert to image and add to PDF
    const textImageDataUrl = canvas.toDataURL('image/png');
    
    // Adjust positioning to center the expanded canvas content
    const adjustedX = rotation !== 0 ? x - (canvasWidth - logo.size.width) * scaleX / 2 : x;
    const adjustedY = rotation !== 0 ? y - (canvasHeight - logo.size.height) * scaleY / 2 : y;
    const adjustedWidth = canvasWidth * scaleX;
    const adjustedHeight = canvasHeight * scaleY;
    
    pdf.addImage(textImageDataUrl, 'PNG', adjustedX, adjustedY, adjustedWidth, adjustedHeight);
    
  } catch (err) {
    console.log("Falling back to standard text rendering:", err);
   
   // Standard PDF text rendering as fallback - also needs rotation support
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
   
   // Get rotation for fallback mode
   const rotation = (logo.type === 'text' && logo.textStyle?.rotation !== undefined)
     ? logo.textStyle.rotation
     : (logo.rotation ?? 0);
   
   // Position and render with rotation
   const textX = x + (width / 2);
   const textY = y + (height / 2);
   
   const text = logo.text || '';
   const textOptions: TextOptions = {
     align: 'center',
     baseline: 'middle'
   };
   
   // Add rotation to text options if needed
   if (rotation !== 0) {
     textOptions.angle = rotation;
   }
   
   if (text.includes('\n')) {
     // For multi-line text in fallback mode
     const lines = text.split('\n');
     pdf.text(lines, textX, textY, textOptions);
   } else {
     pdf.text(text, textX, textY, textOptions);
   }
 }
};