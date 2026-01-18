'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import CameraView from '@/components/ai/CameraView';
import OcrOverlay from '@/components/ai/OcrOverlay';
import Scanner from '@/components/ai/Scanner';
import ScanResults from '@/components/ai/ScanResults';
import FoodPlateResults from '@/components/ai/FoodPlateResults';
import AnimatedButton from '@/components/ui/AnimatedButton';
import NutriGotchiLoader from '@/components/ui/NutriGotchiLoader';
import { ArrowLeft, Camera } from 'lucide-react';
import { VisionScanResult } from '@/types/scan';
import { FoodPlateAnalysis } from '@/lib/ai/geminiClient';
import { useFoodLogs, useAddFoodLog, useBulkAddFoodLogs } from '@/lib/hooks/useFoodLogs';
import { useProfile } from '@/lib/hooks/useProfile';
import { useNavbar } from '@/lib/contexts/NavbarContext';
import { supabase } from '@/lib/supabase/client';

type PageState = 'mode_select' | 'camera' | 'processing' | 'results' | 'error';
type ScanStage = 'idle' | 'processing_vision' | 'complete' | 'error';
type ScanMode = 'label' | 'plate'; // Mode 1: Label Decoder | Mode 2: Warteg Scanner

export default function ScanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hideNavbar, showNavbar } = useNavbar();
  const [scanMode, setScanMode] = useState<ScanMode>('label');
  const [pageState, setPageState] = useState<PageState>('mode_select');
  const [scanStage, setScanStage] = useState<ScanStage>('idle');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [scanResult, setScanResult] = useState<VisionScanResult | null>(null);
  const [foodPlateResult, setFoodPlateResult] = useState<FoodPlateAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  // Hide/show navbar based on page state
  useEffect(() => {
    if (pageState === 'camera' || pageState === 'processing') {
      hideNavbar();
    } else {
      showNavbar();
    }
    // Cleanup: show navbar when leaving the page
    return () => showNavbar();
  }, [pageState, hideNavbar, showNavbar]);

  // Get user ID
  useEffect(() => {
    async function getUserId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        router.push('/login');
      }
    }
    getUserId();
  }, [router]);

  const { data: profile } = useProfile(userId);
  const addFoodLog = useAddFoodLog();
  const bulkAddFoodLogs = useBulkAddFoodLogs();

  // Handle mode selection
  const handleModeSelect = (mode: ScanMode) => {
    setScanMode(mode);
    setPageState('camera');
    setErrorMessage('');
  };

  // === LABEL DECODER MODE (Mode 1 - Gemini Vision) ===

  const handleCaptureLabel = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setPageState('processing');
    setScanStage('processing_vision');
  };

  const handleVisionScanComplete = (result: VisionScanResult) => {
    setScanResult(result);
    setScanStage('complete');
    setTimeout(() => {
      setPageState('results');
    }, 500);
  };

  const handleVisionScanError = (error: Error) => {
    setErrorMessage(error.message);
    setScanStage('error');
    setPageState('error');
  };

  const handleStageChange = (stage: 'processing_vision' | 'complete') => {
    setScanStage(stage);
  };

  // Define nutrition data type for edited values
  interface EditedNutritionData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    sodium: number;
  }

  const handleSaveSingleFood = async (foodName: string, editedNutrition?: EditedNutritionData) => {
    if (!scanResult || !userId) return;

    try {
      // Use edited nutrition if provided, otherwise use original scan result
      const nutritionToSave = editedNutrition || scanResult.nutritionData;

      const foodLogData = {
        user_id: userId,
        food_name: foodName,
        calories: nutritionToSave.calories,
        protein: nutritionToSave.protein,
        carbs: nutritionToSave.carbs || 0,
        fat: nutritionToSave.fat || 0,
        sugar: nutritionToSave.sugar,
        sodium: nutritionToSave.sodium,
        health_grade: scanResult.healthGrade,
        source: 'vision_scan' as const,
        meal_type: null,
        image_url: null,
        nutrition_data: nutritionToSave,
        consumed_at: new Date().toISOString(),
      };

      await addFoodLog.mutateAsync(foodLogData);
      // Note: Toast is shown by ScanResults component
      router.push('/');
    } catch (error) {
      console.error('Failed to save food log:', error);
      // Note: Error handling via ScanResults toast
    }
  };

  // === WARTEG SCANNER MODE (Mode 2 - Gemini Food Plate Analysis) ===

  const handleCapturePlate = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setPageState('processing');
    setScanStage('processing_vision');
  };

  const handleFoodPlateAnalysisComplete = async () => {
    try {
      console.log('[ScanPage] Analyzing food plate with Gemini...');

      const response = await fetch('/api/food-plate-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: capturedImage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze food plate');
      }

      const result: FoodPlateAnalysis = await response.json();
      setFoodPlateResult(result);
      setScanStage('complete');
      setPageState('results');
    } catch (error: any) {
      console.error('[ScanPage] Food plate analysis error:', error);
      setErrorMessage(error.message || 'Gagal menganalisis makanan');
      setPageState('error');
    }
  };

  const handleSaveFoodPlate = async (editedNutrition?: { calories: number; protein_g: number; carbs_g: number; fat_g: number }) => {
    if (!foodPlateResult || !userId) {
      console.error('[Save] Missing data:', { foodPlateResult: !!foodPlateResult, userId: !!userId });
      toast.error('Data tidak lengkap. Coba scan ulang.');
      return;
    }

    try {
      // Use edited values if provided, otherwise use original
      const finalCalories = Math.round(editedNutrition?.calories ?? foodPlateResult.calories ?? 0);
      const finalProtein = Number((editedNutrition?.protein_g ?? foodPlateResult.protein_g ?? 0).toFixed(1));
      const finalCarbs = Number((editedNutrition?.carbs_g ?? foodPlateResult.carbs_g ?? 0).toFixed(1));
      const finalFat = Number((editedNutrition?.fat_g ?? foodPlateResult.fat_g ?? 0).toFixed(1));
      const finalSugar = Number((foodPlateResult.sugar_g ?? 0).toFixed(1));
      const finalSodium = Math.round(foodPlateResult.sodium_mg ?? 0);

      console.log('[Save] Preparing food log:', {
        food_name: foodPlateResult.food_name,
        calories: finalCalories,
        protein: finalProtein,
        carbs: finalCarbs,
        fat: finalFat,
      });

      // Get session token for API call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Sesi berakhir. Silakan login kembali.');
        return;
      }

      // Call API with rewards
      const response = await fetch('/api/food-logs/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          foodLog: {
            food_name: foodPlateResult.food_name,
            calories: finalCalories,
            protein: finalProtein,
            carbs: finalCarbs,
            fat: finalFat,
            sugar: finalSugar,
            sodium: finalSodium,
            health_grade: foodPlateResult.health_grade,
            source: 'vision_scan',
            nutrition_data: {
              calories: finalCalories,
              protein: finalProtein,
              carbs: finalCarbs,
              fat: finalFat,
              sugar: finalSugar,
              sodium: finalSodium,
            },
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save food log');
      }

      console.log('[Save] Success! Result:', data);

      // Show localized success message from API
      // If we have rewards, append them to the message or rely on the simpler API message
      toast.success(data.message || 'Data makanan berhasil disimpan', {
        icon: '📝',
        duration: 3000
      });

      // Force update profile cache with new values
      if (data.newBalance !== undefined) {
        queryClient.setQueryData(['profile', userId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            wallet_balance: data.newBalance,
            current_xp: data.newXp,
            level: data.newLevel,
            max_xp: data.newMaxXp,
          };
        });
      }

      // Invalidate caches for instant UI update
      queryClient.invalidateQueries({ queryKey: ['foodLogs'] });
      queryClient.invalidateQueries({ queryKey: ['nutritionSummary'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      router.push('/');
    } catch (error: any) {
      console.error('[Save] Failed to save food log:', error);
      toast.error(`Gagal menyimpan: ${error?.message || 'Unknown error'} 😞`);
    }
  };

  // === COMMON HANDLERS ===

  const handleEdit = () => {
    alert('Fitur edit akan segera hadir!');
  };

  const handleRescan = () => {
    setPageState('mode_select');
    setScanStage('idle');
    setCapturedImage('');
    setScanResult(null);
    setFoodPlateResult(null);
    setErrorMessage('');
  };

  const handleRetry = () => {
    if (capturedImage) {
      setPageState('processing');
      setScanStage('processing_vision');
    } else {
      handleRescan();
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  // Auto-trigger food plate analysis after capture in plate mode
  useEffect(() => {
    if (pageState === 'processing' && scanMode === 'plate' && capturedImage && scanStage === 'processing_vision') {
      handleFoodPlateAnalysisComplete();
    }
  }, [pageState, scanMode, capturedImage, scanStage]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* LIVING ATMOSPHERE - Same as Dashboard */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-200 rounded-full blur-3xl opacity-40"
          animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-20 right-10 w-[400px] h-[400px] bg-lime-200 rounded-full blur-3xl opacity-30"
          animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-teal-100 rounded-full blur-3xl opacity-35"
          animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10">
        {/* Mode Selection Screen */}
        {pageState === 'mode_select' && (
          <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3">
                  <Camera className="w-10 h-10 text-emerald-600" />
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-teal-900">
                      Scan Makanan
                    </h1>
                    <p className="text-teal-700">
                      Pilih mode scan yang kamu butuhkan
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Mode Cards */}
              <div className="grid grid-cols-1 gap-6 max-w-7xl mx-auto">
                {/* Mode 1: Label Decoder */}
                <motion.button
                  onClick={() => handleModeSelect('label')}
                  className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/60 hover:shadow-xl hover:shadow-emerald-100 transition-all text-left group"
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">📋</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition">
                        Label Decoder
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Scan label gizi pada kemasan makanan/minuman
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Nutrition Label
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Gemini Vision
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Health Grade
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Mode 2: Warteg Scanner */}
                <motion.button
                  onClick={() => handleModeSelect('plate')}
                  className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/60 hover:shadow-xl hover:shadow-amber-100 transition-all text-left group"
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">🍽️</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition">
                        Warteg Scanner
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Foto piring makanan untuk deteksi otomatis
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                          Object Detection
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Gemini Vision
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Multi-Item
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Camera View (Label Mode) */}
        {pageState === 'camera' && scanMode === 'label' && (
          <CameraView
            onCapture={handleCaptureLabel}
            isProcessing={false}
            onBack={handleRescan}
          />
        )}

        {/* Camera View (Warteg Plate Mode) */}
        {pageState === 'camera' && scanMode === 'plate' && (
          <CameraView
            onCapture={handleCapturePlate}
            isProcessing={false}
            onBack={handleRescan}
            useRawCapture={true}
          />
        )}

        {/* Processing Overlay - Label Mode */}
        {pageState === 'processing' && scanMode === 'label' && (
          <>
            <OcrOverlay
              stage={scanStage}
              errorMessage={errorMessage}
              onRetry={handleRetry}
            />
            <Scanner
              imageDataUrl={capturedImage}
              onScanComplete={handleVisionScanComplete}
              onError={handleVisionScanError}
              onStageChange={handleStageChange}
            />
          </>
        )}

        {/* Processing Overlay - Plate Mode */}
        {pageState === 'processing' && scanMode === 'plate' && (
          <OcrOverlay
            stage={scanStage}
            errorMessage={errorMessage}
            onRetry={handleRetry}
            type="food"
          />
        )}

        {/* Results View (Label Mode) */}
        {pageState === 'results' && scanMode === 'label' && scanResult && (
          <ScanResults
            result={scanResult}
            onSave={handleSaveSingleFood}
            onEdit={handleEdit}
            onRescan={handleRescan}
          />
        )}

        {/* Results View (Warteg Plate Mode) */}
        {pageState === 'results' && scanMode === 'plate' && foodPlateResult && (
          <FoodPlateResults
            result={foodPlateResult}
            onSave={handleSaveFoodPlate}
            onRescan={handleRescan}
          />
        )}

        {/* Error View */}
        {pageState === 'error' && (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">😞</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Gagal Memproses
              </h2>
              <p className="text-gray-600 mb-6">
                {errorMessage || 'Terjadi kesalahan. Silakan coba lagi.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition"
                >
                  🔄 Coba Lagi
                </button>
                <button
                  onClick={handleRescan}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition"
                >
                  ← Ubah Mode
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
