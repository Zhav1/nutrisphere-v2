'use client';

import { useState } from 'react';
import { VisionScanResult } from '@/types/scan';

interface ScannerProps {
  imageDataUrl: string;
  onScanComplete: (result: VisionScanResult) => void;
  onError: (error: Error) => void;
  onStageChange?: (stage: 'processing_vision' | 'complete') => void;
}

export default function Scanner({
  imageDataUrl,
  onScanComplete,
  onError,
  onStageChange,
}: ScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Execute Vision pipeline (single-step with Gemini)
  const executePipeline = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Stage 1: Vision Analysis with Gemini 1.5 Flash
      onStageChange?.('processing_vision');
      
      console.log('[Scanner] Sending image to Gemini Vision API...');
      
      const response = await fetch('/api/vision-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: imageDataUrl }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Terlalu banyak permintaan. Tunggu sebentar dan coba lagi.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal menganalisis data nutrisi. Coba lagi.');
      }

      const visionResult: VisionScanResult = await response.json();

      // Check for non-food items (Doll Filter)
      if (visionResult.isValidFood === false) {
        throw new Error(
          visionResult.laymanExplanation || 'Ini bukan label makanan. Scan kemasan makanan/minuman ya!'
        );
      }

      // Validate nutrition data
      if (!visionResult.nutritionData || 
          (visionResult.nutritionData.calories === 0 && 
           visionResult.nutritionData.protein === 0 && 
           visionResult.nutritionData.sugar === 0)) {
        throw new Error(
          'Label tidak terbaca dengan baik. Pastikan label gizi terlihat jelas dan pencahayaan cukup.'
        );
      }

      // Log for debugging
      console.log('[Scanner] Vision analysis complete:', {
        isValidFood: visionResult.isValidFood,
        calories: visionResult.nutritionData.calories,
        healthGrade: visionResult.healthGrade,
      });

      // Stage 2: Complete
      onStageChange?.('complete');

      onScanComplete(visionResult);
    } catch (err) {
      console.error('Scanner vision pipeline error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan. Coba lagi.';
      onError(new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-execute pipeline when component mounts
  useState(() => {
    executePipeline();
  });

  return null; // This is a headless component
}
