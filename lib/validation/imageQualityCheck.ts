/**
 * Image Quality Validation Module
 * Layer 1 of Reliability Architecture - Pre-AI Deterministic Checks
 * 
 * Runs entirely client-side using Canvas API
 * Validates: brightness, blur (sharpness), resolution, contrast
 */

export interface ImageQualityScores {
  brightness: number;   // 0-255 average luminance
  sharpness: number;    // Laplacian variance (higher = sharper)
  resolution: number;   // Total pixels (width × height)
  contrast: number;     // Standard deviation of luminance
}

export type QualityIssue = 
  | 'too_dark' 
  | 'too_bright'
  | 'too_blurry' 
  | 'too_small' 
  | 'low_contrast';

export interface ImageQualityResult {
  isAcceptable: boolean;
  issues: QualityIssue[];
  suggestions: string[];  // User-facing messages in Indonesian
  scores: ImageQualityScores;
  overallScore: number;   // 0-100 composite score
}

// Thresholds for different scan modes
interface QualityThresholds {
  minBrightness: number;
  maxBrightness: number;
  minSharpness: number;
  minResolution: number;
  minContrast: number;
}

const THRESHOLDS: Record<'label' | 'food_plate', QualityThresholds> = {
  label: {
    minBrightness: 50,
    maxBrightness: 230,
    minSharpness: 80,
    minResolution: 307200, // 640×480
    minContrast: 35,
  },
  food_plate: {
    minBrightness: 35,
    maxBrightness: 240,
    minSharpness: 40,
    minResolution: 172800, // 480×360
    minContrast: 25,
  },
};

// Indonesian user-facing messages
const MESSAGES: Record<QualityIssue, { title: string; action: string }> = {
  too_dark: {
    title: 'Foto terlalu gelap',
    action: 'Cari tempat yang lebih terang atau nyalakan flash',
  },
  too_bright: {
    title: 'Foto terlalu terang',
    action: 'Hindari cahaya langsung atau silau',
  },
  too_blurry: {
    title: 'Foto kurang tajam',
    action: 'Tahan HP lebih stabil dan pastikan fokus',
  },
  too_small: {
    title: 'Resolusi terlalu rendah',
    action: 'Dekatkan kamera ke objek',
  },
  low_contrast: {
    title: 'Kontras rendah',
    action: 'Pastikan objek terlihat jelas dengan background',
  },
};

/**
 * Calculate average brightness (luminance) of image
 */
function calculateBrightness(imageData: ImageData): number {
  const data = imageData.data;
  let totalLuminance = 0;
  const pixelCount = data.length / 4;
  
  for (let i = 0; i < data.length; i += 4) {
    // Luminosity formula
    totalLuminance += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  
  return totalLuminance / pixelCount;
}

/**
 * Calculate contrast using standard deviation of luminance
 */
function calculateContrast(imageData: ImageData, meanBrightness: number): number {
  const data = imageData.data;
  let variance = 0;
  const pixelCount = data.length / 4;
  
  for (let i = 0; i < data.length; i += 4) {
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    variance += Math.pow(luminance - meanBrightness, 2);
  }
  
  return Math.sqrt(variance / pixelCount);
}

/**
 * Calculate sharpness using Laplacian variance
 * Higher variance = sharper image
 */
function calculateSharpness(imageData: ImageData): number {
  const { data, width, height } = imageData;
  
  // Convert to grayscale array for convolution
  const gray: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  
  // Laplacian kernel: [[0,-1,0],[-1,4,-1],[0,-1,0]]
  let laplacianSum = 0;
  let laplacianSqSum = 0;
  let count = 0;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      // Apply Laplacian kernel
      const laplacian = 
        -gray[idx - width] +           // top
        -gray[idx - 1] +               // left
        4 * gray[idx] +                // center
        -gray[idx + 1] +               // right
        -gray[idx + width];            // bottom
      
      laplacianSum += laplacian;
      laplacianSqSum += laplacian * laplacian;
      count++;
    }
  }
  
  // Calculate variance (measure of sharpness)
  const mean = laplacianSum / count;
  const variance = (laplacianSqSum / count) - (mean * mean);
  
  return Math.sqrt(Math.abs(variance));
}

/**
 * Downscale image for faster processing
 */
function downscaleForAnalysis(imageData: ImageData, maxDim: number = 400): ImageData {
  const { width, height } = imageData;
  
  if (width <= maxDim && height <= maxDim) {
    return imageData;
  }
  
  const scale = maxDim / Math.max(width, height);
  const newWidth = Math.floor(width * scale);
  const newHeight = Math.floor(height * scale);
  
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageData;
  
  // Put original data on temp canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return imageData;
  
  tempCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
  
  return ctx.getImageData(0, 0, newWidth, newHeight);
}

/**
 * Extract ImageData from base64 data URL
 */
function base64ToImageData(base64: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, img.width, img.height));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
}

/**
 * Main quality check function
 * @param base64Image - Base64 data URL of captured image
 * @param mode - 'label' for nutrition labels, 'food_plate' for food photos
 * @returns Quality assessment with scores and suggestions
 */
export async function checkImageQuality(
  base64Image: string,
  mode: 'label' | 'food_plate' = 'food_plate'
): Promise<ImageQualityResult> {
  const thresholds = THRESHOLDS[mode];
  const issues: QualityIssue[] = [];
  const suggestions: string[] = [];
  
  try {
    const imageData = await base64ToImageData(base64Image);
    const { width, height } = imageData;
    
    // Downscale for faster processing
    const analysisData = downscaleForAnalysis(imageData);
    
    // Calculate all metrics
    const brightness = calculateBrightness(analysisData);
    const contrast = calculateContrast(analysisData, brightness);
    const sharpness = calculateSharpness(analysisData);
    const resolution = width * height;
    
    const scores: ImageQualityScores = {
      brightness: Math.round(brightness),
      sharpness: Math.round(sharpness),
      resolution,
      contrast: Math.round(contrast),
    };
    
    // Check against thresholds
    if (brightness < thresholds.minBrightness) {
      issues.push('too_dark');
      suggestions.push(MESSAGES.too_dark.action);
    }
    
    if (brightness > thresholds.maxBrightness) {
      issues.push('too_bright');
      suggestions.push(MESSAGES.too_bright.action);
    }
    
    if (sharpness < thresholds.minSharpness) {
      issues.push('too_blurry');
      suggestions.push(MESSAGES.too_blurry.action);
    }
    
    if (resolution < thresholds.minResolution) {
      issues.push('too_small');
      suggestions.push(MESSAGES.too_small.action);
    }
    
    if (contrast < thresholds.minContrast) {
      issues.push('low_contrast');
      suggestions.push(MESSAGES.low_contrast.action);
    }
    
    // Calculate overall score (0-100)
    const brightnessScore = Math.min(100, Math.max(0, 
      brightness >= thresholds.minBrightness && brightness <= thresholds.maxBrightness 
        ? 100 
        : 100 - Math.abs(brightness - 128) / 1.28
    ));
    const sharpnessScore = Math.min(100, (sharpness / thresholds.minSharpness) * 80);
    const resolutionScore = Math.min(100, (resolution / thresholds.minResolution) * 80);
    const contrastScore = Math.min(100, (contrast / thresholds.minContrast) * 80);
    
    const overallScore = Math.round(
      (brightnessScore * 0.25) + 
      (sharpnessScore * 0.35) + 
      (resolutionScore * 0.2) + 
      (contrastScore * 0.2)
    );
    
    return {
      isAcceptable: issues.length === 0,
      issues,
      suggestions: [...new Set(suggestions)], // Remove duplicates
      scores,
      overallScore,
    };
  } catch (error) {
    console.error('[ImageQuality] Analysis failed:', error);
    
    // Return permissive result on error (don't block user)
    return {
      isAcceptable: true,
      issues: [],
      suggestions: [],
      scores: { brightness: 128, sharpness: 100, resolution: 640 * 480, contrast: 50 },
      overallScore: 75,
    };
  }
}

/**
 * Get quality indicator color based on score
 */
export function getQualityIndicatorColor(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

/**
 * Get quality issue title in Indonesian
 */
export function getIssueTitle(issue: QualityIssue): string {
  return MESSAGES[issue].title;
}
