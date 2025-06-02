import jsPDF from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import { BagDimensions, calculateBagDimensions } from "../util/BagDimensions";

// Define your Logo and TextStyle interfaces or import them
interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: string;
  rotation?: number; 
}

interface Logo {
  id: string;
  type: 'image' | 'text';
  src?: string;
  text?: string;
  textStyle?: TextStyle;
  position: { x: number, y: number };
  size: { width: number, height: number };
  rotation?: number;
}

export const generatePDF = async (
  dimensions: BagDimensions,
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

          const rotation = (logo.type === 'text' && logo.textStyle?.rotation !== undefined) 
          ? logo.textStyle.rotation 
          : (logo.rotation || 0);
          
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