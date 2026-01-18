'use client';

import { useRef, useState } from 'react';
import { FoodPlateAnalysis } from '@/lib/ai/geminiClient';

interface FoodPlateScanner {
  onAnalysisComplete: (result: FoodPlateAnalysis) => void;
  onError: (error: Error) => void;
}

export default function FoodPlateScanner({
  onAnalysisComplete,
  onError,
}: FoodPlateScanner) {
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle image capture from parent component (CameraView)
  const handleImageCapture = (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    analyzeFood(dataUrl);
  };

  // Analyze food plate using Gemini Vision
  const analyzeFood = async (dataUrl: string) => {
    setIsAnalyzing(true);

    try {
      console.log('[FoodPlateScanner] Sending image to Gemini Vision...');

      const response = await fetch('/api/food-plate-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: dataUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze food plate');
      }

      const result: FoodPlateAnalysis = await response.json();
    
      console.log('[FoodPlateScanner] Analysis complete:', result);

      onAnalysisComplete(result);
    } catch (err) {
      console.error('[FoodPlateScanner] Analysis error:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Gagal menganalisis makanan. Coba lagi.';
      onError(new Error(errorMessage));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return null; // This component doesn't render anything, it just processes the analysis
}

// Export the handler so it can be used by parent components
export { type FoodPlateScanner as FoodPlateScannerProps };
