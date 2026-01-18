import { analyzeNutritionLabel } from '@/lib/ai/geminiClient';
import { VisionScanResult } from '@/types/scan';

/**
 * Processes nutrition label image using Gemini Flash Lite
 * Converts data URL to Base64 and calls Gemini API
 * @param imageDataUrl - Image data URL (data:image/jpeg;base64,...)
 * @returns Vision scan result with nutrition data
 */
export async function processNutritionLabel(
  imageDataUrl: string
): Promise<VisionScanResult> {
  try {
    // Extract base64 data from data URL
    // Format: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    const base64Data = imageDataUrl.split(',')[1];

    if (!base64Data) {
      throw new Error('Invalid image data URL format');
    }

    console.log('[VisionService] Processing image with Gemini Flash Lite, size:', base64Data.length);

    // Use Gemini 2.0 Flash Lite (GA model) for nutrition label analysis
    const result = await analyzeNutritionLabel(base64Data);

    return result;
  } catch (error: any) {
    console.error('[VisionService] Processing error:', error);
    throw new Error('Failed to analyze nutrition label: ' + error?.message);
  }
}

/**
 * Validates if image data URL is in correct format
 * @param dataUrl - Image data URL
 * @returns true if valid
 */
export function isValidImageDataUrl(dataUrl: string): boolean {
  return dataUrl.startsWith('data:image/') && dataUrl.includes('base64,');
}
