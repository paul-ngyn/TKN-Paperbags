// Define image requirements
export const IMAGE_REQUIREMENTS = {
  minWidth: 100,
  minHeight: 100,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxPdfFileSize: 2 * 1024 * 1024, // 2MB for PDFs specifically
  maxPdfDimensions: {
    width: 2000,   // Max width in pixels after conversion
    height: 2000   // Max height in pixels after conversion
  },
  allowedTypes: [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp',
    'application/pdf'
  ]
};

// Type for PDF.js library
interface PDFJSLib {
  getDocument: (options: { url: string }) => { promise: Promise<PDFDocument> };
  GlobalWorkerOptions: {
    workerSrc: string;
  };
}

interface PDFDocument {
  getPage: (pageNumber: number) => Promise<PDFPage>;
  numPages: number;
}

interface PDFPage {
  getViewport: (options: { scale: number }) => PDFViewport;
  render: (context: PDFRenderContext) => { promise: Promise<void> };
}

interface PDFViewport {
  width: number;
  height: number;
}

interface PDFRenderContext {
  canvasContext: CanvasRenderingContext2D;
  viewport: PDFViewport;
}

// Convert PDF to PNG using PDF.js
export const convertPdfToPng = async (file: File): Promise<File> => {
  // Access PDF.js from window object with proper typing
  const PDFJS = (window as typeof window & { pdfjsLib?: PDFJSLib }).pdfjsLib;
  
  if (!PDFJS) {
    throw new Error('PDF.js library not loaded');
  }

  try {
    // Create object URL for the PDF file
    const uri = URL.createObjectURL(file);
    
    // Load the PDF document
    const pdfDoc = await PDFJS.getDocument({ url: uri }).promise;
    
    // Check if PDF has only 1 page
    if (pdfDoc.numPages !== 1) {
      URL.revokeObjectURL(uri);
      throw new Error(`PDF must have exactly 1 page. This PDF has ${pdfDoc.numPages} pages.`);
    }
    
    // Get the first page
    const page = await pdfDoc.getPage(1);
    
    // Get the page dimensions at scale 1 to check original size
    const viewport = page.getViewport({ scale: 1 });
    
    // Check if PDF dimensions are too large
    if (viewport.width > IMAGE_REQUIREMENTS.maxPdfDimensions.width || 
        viewport.height > IMAGE_REQUIREMENTS.maxPdfDimensions.height) {
      URL.revokeObjectURL(uri);
      throw new Error(
        `PDF dimensions too large. Maximum: ${IMAGE_REQUIREMENTS.maxPdfDimensions.width}x${IMAGE_REQUIREMENTS.maxPdfDimensions.height}px. ` +
        `This PDF: ${Math.round(viewport.width)}x${Math.round(viewport.height)}px.`
      );
    }
    
    // Calculate appropriate scale to keep file size reasonable
    const maxDimension = Math.max(viewport.width, viewport.height);
    let scale = 1.0;
    
    // If the PDF is large, reduce the scale to keep output manageable
    if (maxDimension > 1000) {
      scale = 1000 / maxDimension; // Scale down to max 1000px
    } else if (maxDimension < 500) {
      scale = 1.5; // Scale up small PDFs slightly for better quality
    }
    
    const scaledViewport = page.getViewport({ scale });
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    
    // Set canvas dimensions
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;
    
    // Render the page
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport
    };
    
    await page.render(renderContext).promise;
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      // Use JPEG with compression for larger files to reduce size
      const useJpeg = scaledViewport.width * scaledViewport.height > 500000; // ~500k pixels
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        
        // Check if the converted file is too large
        const maxConvertedSize = 50 * 1024 * 1024; // 50MB limit for converted files
        if (blob.size > maxConvertedSize) {
          reject(new Error(
            `Converted file too large (${Math.round(blob.size / (1024 * 1024))}MB). ` +
            `Maximum allowed: ${maxConvertedSize / (1024 * 1024)}MB. Please use a smaller PDF.`
          ));
          return;
        }
        
        const fileExtension = useJpeg ? '.jpg' : '.png';
        const mimeType = useJpeg ? 'image/jpeg' : 'image/png';
        
        // Create new file with appropriate extension
        const convertedFile = new File(
          [blob],
          file.name.replace(/\.pdf$/i, fileExtension),
          { type: mimeType }
        );
        
        resolve(convertedFile);
        
        // Clean up
        URL.revokeObjectURL(uri);
      }, useJpeg ? 'image/jpeg' : 'image/png', useJpeg ? 0.8 : undefined);
    });
    
  } catch (error) {
    console.error('PDF conversion error:', error);
    throw error; // Re-throw to preserve the original error message
  }
};

export const validateImageFile = (file: File): Promise<{ isValid: boolean; error?: string }> => {
  return new Promise(async (resolve) => {
    // Check file type
    if (!IMAGE_REQUIREMENTS.allowedTypes.includes(file.type)) {
      resolve({ 
        isValid: false, 
        error: `Invalid file type. Please use: ${IMAGE_REQUIREMENTS.allowedTypes
          .map(type => type === 'application/pdf' ? 'PDF' : type.split('/')[1].toUpperCase())
          .join(', ')}` 
      });
      return;
    }

    // Check file size (different limits for PDFs)
    const maxSize = file.type === 'application/pdf' ? 
      IMAGE_REQUIREMENTS.maxPdfFileSize : 
      IMAGE_REQUIREMENTS.maxFileSize;
      
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      resolve({ 
        isValid: false, 
        error: `File too large. Maximum size for ${file.type === 'application/pdf' ? 'PDFs' : 'images'}: ${maxSizeMB}MB.` 
      });
      return;
    }

    // Handle PDF files - validate structure and page count
    if (file.type === 'application/pdf') {
      try {
        if (file.size === 0) {
          resolve({ isValid: false, error: 'PDF file is empty.' });
          return;
        }
        
        // Simple header check
        const headerBytes = await file.slice(0, 5).arrayBuffer();
        const headerView = new Uint8Array(headerBytes);
        const header = new TextDecoder().decode(headerView);
        
        if (!header.startsWith('%PDF')) {
          resolve({ isValid: false, error: 'File does not appear to be a valid PDF.' });
          return;
        }

        // Check page count and dimensions using PDF.js
        const PDFJS = (window as typeof window & { pdfjsLib?: PDFJSLib }).pdfjsLib;
        if (PDFJS) {
          try {
            const uri = URL.createObjectURL(file);
            const pdfDoc = await PDFJS.getDocument({ url: uri }).promise;
            
            if (pdfDoc.numPages !== 1) {
              URL.revokeObjectURL(uri);
              resolve({ 
                isValid: false, 
                error: `PDF must have exactly 1 page. This PDF has ${pdfDoc.numPages} pages.` 
              });
              return;
            }
            
            // Check PDF dimensions
            const page = await pdfDoc.getPage(1);
            const viewport = page.getViewport({ scale: 1 });
            
            if (viewport.width > IMAGE_REQUIREMENTS.maxPdfDimensions.width || 
                viewport.height > IMAGE_REQUIREMENTS.maxPdfDimensions.height) {
              URL.revokeObjectURL(uri);
              resolve({ 
                isValid: false, 
                error: `PDF dimensions too large. Maximum: ${IMAGE_REQUIREMENTS.maxPdfDimensions.width}x${IMAGE_REQUIREMENTS.maxPdfDimensions.height}px. This PDF: ${Math.round(viewport.width)}x${Math.round(viewport.height)}px.` 
              });
              return;
            }
            
            URL.revokeObjectURL(uri);
          } catch {
            resolve({ isValid: false, error: 'Could not read PDF file.' });
            return;
          }
        }
        
        resolve({ isValid: true });
      } catch {
        resolve({ isValid: false, error: 'Could not validate PDF file.' });
      }
      return;
    }

    // For images, validate dimensions
    const img = new window.Image();
    img.onload = () => {
      if (img.width < IMAGE_REQUIREMENTS.minWidth || img.height < IMAGE_REQUIREMENTS.minHeight) {
        resolve({ 
          isValid: false, 
          error: `Image too small. Minimum dimensions: ${IMAGE_REQUIREMENTS.minWidth}x${IMAGE_REQUIREMENTS.minHeight}px.` 
        });
      } else {
        resolve({ isValid: true });
      }
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      resolve({ 
        isValid: false, 
        error: 'Invalid image file or corrupted file.' 
      });
      URL.revokeObjectURL(img.src);
    };
    
    img.src = URL.createObjectURL(file);
  });
};