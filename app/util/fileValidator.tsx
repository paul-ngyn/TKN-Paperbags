// Define image requirements
export const IMAGE_REQUIREMENTS = {
  minWidth: 100,
  minHeight: 100,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'application/pdf'
  ]
};

// Convert PDF to PNG using PDF.js
export const convertPdfToPng = async (file: File): Promise<File> => {
  // Access PDF.js from window object (you'll need to load it via CDN)
  const PDFJS = (window as any).pdfjsLib;
  
  if (!PDFJS) {
    throw new Error('PDF.js library not loaded');
  }

  try {
    // Create object URL for the PDF file
    const uri = URL.createObjectURL(file);
    
    // Load the PDF document
    const pdfDoc = await PDFJS.getDocument({ url: uri }).promise;
    
    // Get the first page
    const page = await pdfDoc.getPage(1);
    
    // Set scale for good quality
    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    
    // Set canvas dimensions
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render the page
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        
        // Create new file with PNG extension
        const convertedFile = new File(
          [blob],
          file.name.replace(/\.pdf$/i, '.png'),
          { type: 'image/png' }
        );
        
        resolve(convertedFile);
        
        // Clean up
        URL.revokeObjectURL(uri);
      }, 'image/png');
    });
    
  } catch (error) {
    console.error('PDF conversion error:', error);
    throw new Error('Failed to convert PDF to PNG');
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

    // Check file size
    if (file.size > IMAGE_REQUIREMENTS.maxFileSize) {
      resolve({ 
        isValid: false, 
        error: `File too large. Maximum size is ${IMAGE_REQUIREMENTS.maxFileSize / (1024 * 1024)}MB.` 
      });
      return;
    }

    // Handle PDF files - validate structure
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
        
        resolve({ isValid: true });
      } catch (error) {
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