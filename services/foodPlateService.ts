import { analyzeFoodPlate, FoodPlateAnalysis } from '@/lib/ai/geminiClient';

/**
 * Processes food plate image using Gemini Vision
 * Converts data URL to Base64 and calls Gemini API for Indonesian food analysis
 * @param imageDataUrl - Image data URL (data:image/jpeg;base64,...)
 * @returns Comprehensive food analysis with nutrition data
 */
export async function processFoodPlate(
  imageDataUrl: string
): Promise<FoodPlateAnalysis> {
  try {
    // Extract base64 data from data URL
    // Format: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    const base64Data = imageDataUrl.split(',')[1];

    if (!base64Data) {
      throw new Error('Invalid image data URL format');
    }

    console.log('[FoodPlateService] Processing plate image with Gemini Vision, size:', base64Data.length);

    // Use Gemini's Indonesian food expertise for analysis
    const result = await analyzeFoodPlate(base64Data);

    return result;
  } catch (error: any) {
    console.error('[FoodPlateService] Processing error:', error);
    throw new Error('Failed to analyze food plate: ' + error?.message);
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
