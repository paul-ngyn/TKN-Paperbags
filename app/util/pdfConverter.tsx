import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';

// Configure the worker for PDF.js
if (typeof window !== 'undefined') {
  // Use the simplest possible worker configuration to avoid issues
  GlobalWorkerOptions.workerSrc = '';
}

// Simple PDF to image converter with resilience features
export const processPDFToImage = async (file: File): Promise<File> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Starting simplified PDF conversion");
      
      // Basic validation
      if (file.type !== 'application/pdf') {
        reject(new Error('Not a PDF file'));
        return;
      }

      if (file.size === 0 || file.size > 10 * 1024 * 1024) {
        reject(new Error(`PDF file ${file.size === 0 ? 'is empty' : 'is too large (max 10MB)'}`));
        return;
      }

      // Create a canvas for rendering
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }
      
      // Set a reasonable size for the canvas initially
      canvas.width = 800;
      canvas.height = 1000;
      
      // Draw a white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Try to load and render the PDF without using worker features
      try {
        // Load the PDF data
        const arrayBuffer = await file.arrayBuffer();
        
        // Use a simplified loading approach
        const loadingTask = getDocument({
          data: arrayBuffer,
          disableFontFace: true,
          isEvalSupported: false
        });
        
        // Add a timeout to avoid hanging
        const pdf = await Promise.race([
          loadingTask.promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('PDF loading timed out')), 10000)
          )
        ]) as PDFDocumentProxy;
        
        // Get the first page
        const page = await Promise.race([
          pdf.getPage(1),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('PDF page loading timed out')), 8000)
          )
        ]) as any;
        
        // Size the canvas appropriately
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Draw white background again with new dimensions
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Render the page
        await Promise.race([
          page.render({
            canvasContext: ctx,
            viewport: viewport
          }).promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('PDF rendering timed out')), 8000)
          )
        ]);
        
        // Convert to PNG
        const blob = await new Promise<Blob>((resolve, reject) => {
          const blobTimeout = setTimeout(() => {
            reject(new Error('Image conversion timed out'));
          }, 5000);
          
          canvas.toBlob(result => {
            clearTimeout(blobTimeout);
            if (result) resolve(result);
            else reject(new Error('Failed to create image from PDF'));
          }, 'image/png', 0.8);
        });
        
        // Create a file from the blob
        const convertedFile = new File(
          [blob],
          file.name.replace(/\.pdf$/i, '_converted.png'),
          { type: 'image/png' }
        );
        
        resolve(convertedFile);
        
      } catch (renderError) {
        console.error('PDF rendering failed, trying fallback method', renderError);
        
        // Fallback - just create a placeholder image with the PDF filename
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PDF Preview', canvas.width / 2, 100);
        
        ctx.font = '18px Arial';
        ctx.fillText(file.name, canvas.width / 2, 150);
        ctx.fillText('(PDF conversion failed)', canvas.width / 2, 180);
        
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(result => {
            if (result) resolve(result);
            else reject(new Error('Failed to create fallback image'));
          }, 'image/png', 0.9);
        });
        
        const fallbackFile = new File(
          [blob],
          file.name.replace(/\.pdf$/i, '_preview.png'),
          { type: 'image/png' }
        );
        
        resolve(fallbackFile);
      }
      
    } catch (error) {
      console.error('PDF processing error:', error);
      reject(new Error(`PDF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};

export const validatePDFFile = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  try {
    // Basic validation only
    if (file.type !== 'application/pdf') {
      return { 
        isValid: false, 
        error: 'Not a PDF file.' 
      };
    }
    
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'PDF file is empty.'
      };
    }
    
    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        error: 'PDF file is too large. Maximum size is 10MB.'
      };
    }
    
    // Simple header check
    const headerBytes = await file.slice(0, 5).arrayBuffer();
    const headerView = new Uint8Array(headerBytes);
    const header = new TextDecoder().decode(headerView);
    
    if (!header.startsWith('%PDF')) {
      return { 
        isValid: false, 
        error: 'File does not appear to be a valid PDF.' 
      };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('PDF validation error:', error);
    return { 
      isValid: false, 
      error: 'Could not validate PDF file.' 
    };
  }
};