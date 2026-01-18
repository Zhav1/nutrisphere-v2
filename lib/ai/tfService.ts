/**
 * TensorFlow.js Object Detection Service
 * Provides lazy-loaded COCO-SSD model for food detection
 * 
 * Architecture:
 * - Singleton pattern: Model loaded once per session
 * - Lazy loading: ~5MB bundle loaded only when needed
 * - Food filtering: Returns only food-related detections
 */

import type * as cocoSsd from '@tensorflow-models/coco-ssd';

// Singleton instance
let modelInstance: cocoSsd.ObjectDetection | null = null;
let modelLoadingPromise: Promise<cocoSsd.ObjectDetection> | null = null;

// Configuration
const MIN_CONFIDENCE = 0.5; // Minimum detection confidence threshold
const MAX_DETECTIONS = 20; // Maximum number of objects to detect

// COCO-SSD food-related classes
// Full list: https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts
const FOOD_CLASSES = new Set([
  'banana',
  'apple',
  'sandwich',
  'orange',
  'broccoli',
  'carrot',
  'hot dog',
  'pizza',
  'donut',
  'cake',
  'bowl',        // Often contains food
  'cup',         // Beverages
  'bottle',      // Beverages
  'wine glass',  // Beverages
  'fork',        // Indicates food nearby
  'knife',       // Indicates food nearby
  'spoon',       // Indicates food nearby
]);

export interface DetectedObject {
  class: string;          // COCO-SSD class name (e.g., "banana")
  score: number;          // Confidence score (0-1)
  bbox: [number, number, number, number]; // [x, y, width, height]
}

/**
 * Load TensorFlow.js and COCO-SSD model (lazy loading)
 * Uses singleton pattern to avoid reloading
 * @returns Promise<ObjectDetection> - Loaded model instance
 */
export async function loadModel(): Promise<cocoSsd.ObjectDetection> {
  // Return existing instance if already loaded
  if (modelInstance) {
    console.log('[TFService] Model already loaded, returning cached instance');
    return modelInstance;
  }

  // If loading is in progress, return the same promise
  if (modelLoadingPromise) {
    console.log('[TFService] Model loading in progress, waiting...');
    return modelLoadingPromise;
  }

  console.log('[TFService] Starting model load (this may take 5-10 seconds)...');
  
  // Create loading promise
  modelLoadingPromise = (async () => {
    try {
      // Dynamic import to avoid bundling TensorFlow.js in main bundle
      const tf = await import('@tensorflow/tfjs');
      await tf.ready();
      console.log('[TFService] TensorFlow.js backend ready:', tf.getBackend());

      const cocoSsdModule = await import('@tensorflow-models/coco-ssd');
      console.log('[TFService] Loading COCO-SSD model...');
      
      const model = await cocoSsdModule.load({
        base: 'lite_mobilenet_v2', // Faster, smaller model (good for mobile)
      });

      console.log('[TFService] COCO-SSD model loaded successfully!');
      modelInstance = model;
      return model;
    } catch (error) {
      console.error('[TFService] Model loading failed:', error);
      modelLoadingPromise = null; // Reset so we can retry
      throw new Error('Gagal memuat model AI. Periksa koneksi internet Anda.');
    }
  })();

  return modelLoadingPromise;
}

/**
 * Detect food items in an image
 * @param imageElement - HTML Image, Video, or Canvas element
 * @param options - Detection options
 * @returns Promise<DetectedObject[]> - Array of detected food items
 */
export async function detectFoods(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  options: {
    minConfidence?: number;
    maxDetections?: number;
    filterFoodOnly?: boolean;
  } = {}
): Promise<DetectedObject[]> {
  const {
    minConfidence = MIN_CONFIDENCE,
    maxDetections = MAX_DETECTIONS,
    filterFoodOnly = true,
  } = options;

  try {
    // Load model if not already loaded
    const model = await loadModel();

    console.log('[TFService] Running object detection...');
    const startTime = performance.now();

    // Run detection
    const predictions = await model.detect(imageElement, maxDetections);

    const endTime = performance.now();
    console.log(`[TFService] Detection completed in ${(endTime - startTime).toFixed(0)}ms`);
    console.log(`[TFService] Raw predictions:`, predictions.length);

    // Filter by confidence and food classes
    let filtered = predictions.filter(pred => pred.score >= minConfidence);

    if (filterFoodOnly) {
      filtered = filtered.filter(pred => FOOD_CLASSES.has(pred.class));
    }

    console.log(`[TFService] Filtered predictions (food only, confidence ≥ ${minConfidence}):`, filtered.length);

    // Convert to our format
    const detectedObjects: DetectedObject[] = filtered.map(pred => ({
      class: pred.class,
      score: pred.score,
      bbox: pred.bbox,
    }));

    return detectedObjects;
  } catch (error) {
    console.error('[TFService] Detection error:', error);
    throw new Error('Gagal mendeteksi makanan. Coba lagi.');
  }
}

/**
 * Unload the model to free memory
 * Call this when switching away from object detection mode
 */
export async function unloadModel(): Promise<void> {
  if (modelInstance) {
    console.log('[TFService] Unloading model to free memory...');
    modelInstance.dispose();
    modelInstance = null;
    modelLoadingPromise = null;
  }
}

/**
 * Check if model is currently loaded
 */
export function isModelLoaded(): boolean {
  return modelInstance !== null;
}
