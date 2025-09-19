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
    // Check if this is shaped text
    const textShape = logo.textStyle?.textShape || 'normal';
    
    if (textShape !== 'normal') {
      // For shaped text, create an SVG and render it
      addShapedTextToPdf(pdf, logo, x, y, width, height, scaleX, scaleY);
      return;
    }
    
    // Continue with existing normal text rendering...
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
      const radians = (Math.abs(rotation) * Math.PI) / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      
      canvasWidth = Math.ceil(logo.size.width * cos + logo.size.height * sin);
      canvasHeight = Math.ceil(logo.size.width * sin + logo.size.height * cos);
    }
    
    // Set canvas properties
    const pixelRatio = 5;
    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    if (rotation !== 0) {
      ctx.save();
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
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
    
    if (hasLineBreaks) {
      const lineHeight = fontSize * 1.4;
      const centerX = logo.size.width / 2 - (fontSize * 0.09); 
      const lines = text.split('\n');
      const totalTextHeight = lines.length * lineHeight;
      const startY = (logo.size.height - totalTextHeight) / 2 + lineHeight / 2;
      
      lines.forEach((line, index) => {
        ctx.fillText(line, centerX, startY + (index * lineHeight));
      });
    } else {
      const centerX = logo.size.width / 2 - (fontSize * 0.09);
      const centerY = logo.size.height / 2 - (fontSize * 0.14);
      const verticalOffset = fontSize * 0.08;
      ctx.fillText(text, centerX, centerY + verticalOffset);
    }
    
    if (rotation !== 0) {
      ctx.restore();
    }
    
    const textImageDataUrl = canvas.toDataURL('image/png');
    
    const adjustedX = rotation !== 0 ? x - (canvasWidth - logo.size.width) * scaleX / 2 : x;
    const adjustedY = rotation !== 0 ? y - (canvasHeight - logo.size.height) * scaleY / 2 : y;
    const adjustedWidth = canvasWidth * scaleX;
    const adjustedHeight = canvasHeight * scaleY;
    
    pdf.addImage(textImageDataUrl, 'PNG', adjustedX, adjustedY, adjustedWidth, adjustedHeight);
    
  } catch (err) {
    console.log("Falling back to standard text rendering:", err);
    
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
    
    const color = logo.textStyle?.color || '#000000';
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    pdf.setTextColor(r, g, b);
    
    const rotation = (logo.type === 'text' && logo.textStyle?.rotation !== undefined)
      ? logo.textStyle.rotation
      : (logo.rotation ?? 0);
    
    const textX = x + (width / 2);
    const textY = y + (height / 2);
    
    const text = logo.text || '';
    const textOptions: TextOptions = {
      align: 'center',
      baseline: 'middle'
    };
    
    if (rotation !== 0) {
      textOptions.angle = rotation;
    }
    
    if (text.includes('\n')) {
      const lines = text.split('\n');
      pdf.text(lines, textX, textY, textOptions);
    } else {
      pdf.text(text, textX, textY, textOptions);
    }
  }
};

// Replace the addShapedTextToPdf function with this corrected version:

const addShapedTextToPdf = (pdf: jsPDF, logo: Logo, x: number, y: number, width: number, height: number, scaleX: number, scaleY: number) => {
  try {
    // Create canvas for shaped text rendering
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error("Could not create canvas context for shaped text");
    }
    
    const letters = (logo.text || "Text").split('');
    const fontSize = logo.textStyle?.fontSize || 24;
    const fontFamily = logo.textStyle?.fontFamily || 'Arial';
    const color = logo.textStyle?.color || '#000000';
    const fontWeight = logo.textStyle?.fontWeight || 'normal';
    const textShape = logo.textStyle?.textShape || 'normal';
    
    // Calculate the actual bounds needed for the shaped text
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    // First pass: calculate bounds
    letters.forEach((letter, index) => {
      let letterX = 100, letterY = 50; // Base coordinates in 200x100 viewBox
      
      switch (textShape) {
        case 'pyramid':
          const rowSize = Math.ceil(Math.sqrt(letters.length));
          const row = Math.floor(index / rowSize);
          const col = index % rowSize;
          const rowWidth = Math.max(1, rowSize - row);
          letterX = 100 + (col - (rowWidth - 1) / 2) * 30;
          letterY = 20 + row * 25;
          break;
          
        case 'cone':
          const coneRowSize = Math.ceil(Math.sqrt(letters.length));
          const coneRow = Math.floor(index / coneRowSize);
          const coneCol = index % coneRowSize;
          const coneRowWidth = Math.min(coneRowSize, coneRow + 1);
          letterX = 100 + (coneCol - (coneRowWidth - 1) / 2) * 30;
          letterY = 20 + coneRow * 25;
          break;
          
        case 'arc-up':
          const upAngle = (Math.PI / (letters.length - 1)) * index - Math.PI / 2;
          const upRadius = 60;
          letterX = 100 + Math.cos(upAngle) * upRadius;
          letterY = 50 + Math.sin(upAngle) * upRadius + 30;
          break;
          
        case 'arc-down':
          const downAngle = (Math.PI / (letters.length - 1)) * index + Math.PI / 2;
          const downRadius = 60;
          letterX = 100 + Math.cos(downAngle) * downRadius;
          letterY = 50 + Math.sin(downAngle) * downRadius - 20;
          break;
          
        case 'wave':
          letterX = 20 + (index * 160) / letters.length;
          letterY = 50 + Math.sin((index / letters.length) * Math.PI * 2) * 25;
          break;
          
        case 'circle':
          const circleAngle = (2 * Math.PI / letters.length) * index;
          const circleRadius = 70;
          letterX = 100 + Math.cos(circleAngle) * circleRadius;
          letterY = 50 + Math.sin(circleAngle) * circleRadius;
          break;
      }
      
      minX = Math.min(minX, letterX);
      maxX = Math.max(maxX, letterX);
      minY = Math.min(minY, letterY);
      maxY = Math.max(maxY, letterY);
    });
    
    // Add padding for text
    const padding = fontSize * 0.5;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;
    
    // Calculate the actual content dimensions
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    // Set canvas size with high pixel ratio for quality
    const pixelRatio = 3;
    canvas.width = logo.size.width * pixelRatio;
    canvas.height = logo.size.height * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
    
    // Clear canvas
    ctx.clearRect(0, 0, logo.size.width, logo.size.height);
    
    // Set text styling
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Calculate scaling to fit the shaped text within the logo bounds
    const scaleToFit = Math.min(
      (logo.size.width * 0.9) / contentWidth,
      (logo.size.height * 0.9) / contentHeight
    );
    
    // Calculate offset to center the content
    const centerX = logo.size.width / 2;
    const centerY = logo.size.height / 2;
    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;
    
    // Second pass: render the letters
    letters.forEach((letter, index) => {
      let letterX = 100, letterY = 50;
      let rotation = 0;
      
      switch (textShape) {
        case 'pyramid':
          const rowSize = Math.ceil(Math.sqrt(letters.length));
          const row = Math.floor(index / rowSize);
          const col = index % rowSize;
          const rowWidth = Math.max(1, rowSize - row);
          letterX = 100 + (col - (rowWidth - 1) / 2) * 30;
          letterY = 20 + row * 25;
          break;
          
        case 'cone':
          const coneRowSize = Math.ceil(Math.sqrt(letters.length));
          const coneRow = Math.floor(index / coneRowSize);
          const coneCol = index % coneRowSize;
          const coneRowWidth = Math.min(coneRowSize, coneRow + 1);
          letterX = 100 + (coneCol - (coneRowWidth - 1) / 2) * 30;
          letterY = 20 + coneRow * 25;
          break;
          
        case 'arc-up':
          const upAngle = (Math.PI / (letters.length - 1)) * index - Math.PI / 2;
          const upRadius = 60;
          letterX = 100 + Math.cos(upAngle) * upRadius;
          letterY = 50 + Math.sin(upAngle) * upRadius + 30;
          rotation = (upAngle * 180) / Math.PI + 90;
          break;
          
        case 'arc-down':
          const downAngle = (Math.PI / (letters.length - 1)) * index + Math.PI / 2;
          const downRadius = 60;
          letterX = 100 + Math.cos(downAngle) * downRadius;
          letterY = 50 + Math.sin(downAngle) * downRadius - 20;
          rotation = (downAngle * 180) / Math.PI - 90;
          break;
          
        case 'wave':
          letterX = 20 + (index * 160) / letters.length;
          letterY = 50 + Math.sin((index / letters.length) * Math.PI * 2) * 25;
          break;
          
        case 'circle':
          const circleAngle = (2 * Math.PI / letters.length) * index;
          const circleRadius = 70;
          letterX = 100 + Math.cos(circleAngle) * circleRadius;
          letterY = 50 + Math.sin(circleAngle) * circleRadius;
          rotation = (circleAngle * 180) / Math.PI + 90;
          break;
      }
      
      // Transform coordinates to fit within the logo bounds
      const scaledX = centerX + (letterX - contentCenterX) * scaleToFit;
      const scaledY = centerY + (letterY - contentCenterY) * scaleToFit;
      
      // Scale font size as well
      const scaledFontSize = fontSize * scaleToFit;
      ctx.font = `${fontWeight} ${scaledFontSize}px ${fontFamily}`;
      
      // Apply rotation if needed
      if (rotation !== 0) {
        ctx.save();
        ctx.translate(scaledX, scaledY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(letter, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(letter, scaledX, scaledY);
      }
    });
    
    // Convert canvas to image and add to PDF
    const shapedTextImageDataUrl = canvas.toDataURL('image/png');
    pdf.addImage(shapedTextImageDataUrl, 'PNG', x, y, width, height);
    
  } catch (err) {
    console.error("Failed to render shaped text in PDF:", err);
    // Fallback to regular text - create a properly typed fallback logo
    const fallbackLogo: Logo = {
      ...logo,
      textStyle: {
        fontFamily: logo.textStyle?.fontFamily || 'Arial',
        fontSize: logo.textStyle?.fontSize || 24,
        color: logo.textStyle?.color || '#000000',
        fontWeight: logo.textStyle?.fontWeight || 'normal',
        rotation: logo.textStyle?.rotation || 0,
        textShape: 'normal'
      }
    };
    addTextToPdf(pdf, fallbackLogo, x, y, width, height, scaleX, scaleY);
  }
};