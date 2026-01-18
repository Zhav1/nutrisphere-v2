import { HealthGrade } from './user';

export interface NutritionalInfo {
  calories: number; // kCal
  protein: number; // grams
  sugar: number; // grams
  sodium: number; // mg
  carbs: number; // grams
  fat: number; // grams
}

/**
 * Result from Gemini Vision analysis of nutrition label
 * No OCR involved - direct multimodal vision analysis
 */
export interface VisionScanResult {
  isValidFood: boolean; // Doll Filter - detects non-food items
  nutritionData: NutritionalInfo; // Extracted from vision analysis
  healthGrade: HealthGrade;
  laymanExplanation: string; // Detailed explanation in Indonesian slang
}

/**
 * Detected food item from TensorFlow.js object detection
 */
export interface DetectedFood {
  label: string; // COCO-SSD label (e.g., "banana")
  indonesianName: string; // Indonesian translation (e.g., "Pisang")
  confidence: number; // Detection confidence (0-1)
  bbox: [number, number, number, number]; // [x, y, width, height]
  nutritionData: NutritionalInfo; // Nutrition per serving
  servingSize: string; // e.g., "1 buah sedang (118g)"
}

/**
 * Result from TensorFlow.js object detection (Mode 2: Warteg Scanner)
 */
export interface ObjectDetectionResult {
  detectedFoods: DetectedFood[]; // All detected food items
  totalNutrition: NutritionalInfo; // Sum of all items
  imageDataUrl?: string; // Original captured image
}

// Legacy interface for backward compatibility
export interface ScanResult extends VisionScanResult {
  rawText?: string; // @deprecated - Not used in vision pipeline
  sanitizedData?: NutritionalInfo; // @deprecated - Use nutritionData instead
  warningMessage?: string; // @deprecated - Use laymanExplanation instead
}