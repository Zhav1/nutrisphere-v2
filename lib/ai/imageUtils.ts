/**
 * Image preprocessing utilities for OCR optimization
 * Implements Canvas-based transformations to improve Tesseract.js accuracy
 */
/**
 * Converts image to high-contrast grayscale for better OCR accuracy
 * This reduces noise and makes text more distinguishable
 * @param imageData - ImageData from canvas
 * @returns Processed ImageData with high-contrast grayscale
 */
export function preprocessImage(imageData: ImageData): ImageData {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Grayscale conversion using luminosity method
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    
    // High-contrast thresholding (binary: black or white)
    const threshold = gray > 128 ? 255 : 0;
    
    data[i] = threshold;     // R
    data[i + 1] = threshold; // G
    data[i + 2] = threshold; // B
    // Alpha channel (i+3) remains unchanged
  }
  
  return imageData;
}
/**
 * Converts a video frame or image to a base64 data URL
 * Applies preprocessing for OCR (grayscale + high contrast)
 * Use this for Label Decoder mode (nutrition label scanning)
 * @param video - HTMLVideoElement or HTMLImageElement
 * @returns Base64 data URL with preprocessed image
 */
export function captureFrame(video: HTMLVideoElement | HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = video instanceof HTMLVideoElement ? video.videoWidth : video.width;
  canvas.height = video instanceof HTMLVideoElement ? video.videoHeight : video.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Apply preprocessing (for OCR/Label reading only)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const processed = preprocessImage(imageData);
  ctx.putImageData(processed, 0, 0);
  
  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Captures a video frame WITHOUT preprocessing - preserves full color
 * Use this for Warteg Scanner mode (food plate detection)
 * @param video - HTMLVideoElement or HTMLImageElement
 * @returns Base64 data URL with full-color image
 */
export function captureFrameRaw(video: HTMLVideoElement | HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = video instanceof HTMLVideoElement ? video.videoWidth : video.width;
  canvas.height = video instanceof HTMLVideoElement ? video.videoHeight : video.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // NO preprocessing - preserve original colors for food detection
  return canvas.toDataURL('image/jpeg', 0.9);
}
/**
 * Resizes image to optimal dimensions for OCR (max 1280px width)
 * Reduces processing time without sacrificing accuracy
 */
export function resizeForOcr(imageData: ImageData, maxWidth: number = 1280): ImageData {
  if (imageData.width <= maxWidth) return imageData;
  
  const scale = maxWidth / imageData.width;
  const newWidth = maxWidth;
  const newHeight = Math.floor(imageData.height * scale);
  
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('Failed to get temp canvas context');
  
  tempCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
  
  return ctx.getImageData(0, 0, newWidth, newHeight);
}
