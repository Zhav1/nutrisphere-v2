import { create } from 'zustand';
import { VisionScanResult } from '@/types/scan';

type ScanStage = 'idle' | 'capturing' | 'processing_vision' | 'complete';

interface AppState {
  isScanning: boolean;
  scanStage: ScanStage;
  currentScanResult: VisionScanResult | null;
  error: string | null;
  actions: {
    startScan: () => void;
    processImage: (imageData: string) => Promise<void>;
    reset: () => void;
    setError: (error: string) => void;
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  isScanning: false,
  scanStage: 'idle',
  currentScanResult: null,
  error: null,
  
  actions: {
    startScan: () => {
      set({ 
        isScanning: true, 
        scanStage: 'capturing', 
        error: null,
        currentScanResult: null 
      });
    },
    
    processImage: async (imageData: string) => {
      try {
        // Stage 1: Vision Analysis with Gemini
        set({ scanStage: 'processing_vision' });
        
        const response = await fetch('/api/vision-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to analyze nutrition label');
        }
        
        const visionResult: VisionScanResult = await response.json();
        
        // Check for non-food items
        if (visionResult.isValidFood === false) {
          throw new Error(
            visionResult.laymanExplanation || 'Invalid food item detected'
          );
        }
        
        set({ 
          scanStage: 'complete',
          currentScanResult: visionResult,
          isScanning: false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set({ 
          error: errorMessage,
          isScanning: false,
          scanStage: 'idle',
        });
      }
    },
    
    reset: () => {
      set({ 
        isScanning: false, 
        scanStage: 'idle', 
        currentScanResult: null,
        error: null,
      });
    },
    
    setError: (error: string) => {
      set({ error, isScanning: false, scanStage: 'idle' });
    },
  },
}));

// Selector hooks for performance optimization
export const useIsScanning = () => useAppStore(state => state.isScanning);
export const useScanStage = () => useAppStore(state => state.scanStage);
export const useScanResult = () => useAppStore(state => state.currentScanResult);
export const useScanError = () => useAppStore(state => state.error);
export const useScanActions = () => useAppStore(state => state.actions);
