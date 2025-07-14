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
    'application/pdf'  // Keep allowing PDFs
  ]
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

    // Handle PDF files with simple validation
    if (file.type === 'application/pdf') {
      // Inlined validation logic from the deleted file
      try {
        if (file.size === 0) {
          resolve({ isValid: false, error: 'PDF file is empty.' });
          return;
        }
        
        // Simple header check to ensure it's a valid PDF
        const headerBytes = await file.slice(0, 5).arrayBuffer();
        const headerView = new Uint8Array(headerBytes);
        const header = new TextDecoder().decode(headerView);
        
        if (!header.startsWith('%PDF')) {
          resolve({ isValid: false, error: 'File does not appear to be a valid PDF.' });
          return;
        }
        
        // If all checks pass for the PDF, it's valid
        resolve({ isValid: true });
      } catch (error) {
        console.error('PDF validation error:', error);
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