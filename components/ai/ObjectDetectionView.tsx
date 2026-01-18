'use client';

import { useEffect, useRef, useState } from 'react';
import { detectFoods, loadModel, isModelLoaded } from '@/lib/ai/tfService';
import { getFoodNutrition } from '@/lib/data/foodCalories';
import { DetectedFood } from '@/types/scan';

interface ObjectDetectionViewProps {
  onDetectionComplete: (detectedFoods: DetectedFood[]) => void;
  onError: (error: Error) => void;
}

export default function ObjectDetectionView({
  onDetectionComplete,
  onError,
}: ObjectDetectionViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Initialize camera
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        currentStream = mediaStream;
        setStream(mediaStream);
        setHasPermission(true);
        setError('');

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Camera initialization error:', err);
        setHasPermission(false);
        
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setError('Akses kamera ditolak. Silakan izinkan akses kamera.');
          } else if (err.name === 'NotFoundError') {
            setError('Kamera tidak ditemukan.');
          } else {
            setError('Gagal mengakses kamera. Coba lagi.');
          }
        }
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Pre-load TensorFlow.js model when component mounts
  useEffect(() => {
    if (!isModelLoaded()) {
      setLoadingMessage('Memuat model AI...');
      loadModel()
        .then(() => {
          console.log('[ObjectDetectionView] Model pre-loaded successfully');
          setLoadingMessage('');
        })
        .catch(err => {
          console.error('[ObjectDetectionView] Model pre-load failed:', err);
          setLoadingMessage('');
        });
    }
  }, []);

  // Capture photo from video stream
  const handleCapture = () => {
    if (!videoRef.current || isDetecting) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageDataUrl);
      
      // Run detection immediately after capture
      runDetection(imageDataUrl);
    } catch (err) {
      console.error('Capture error:', err);
      setError('Gagal mengambil foto. Coba lagi.');
    }
  };

  // Run TensorFlow.js object detection
  const runDetection = async (imageDataUrl: string) => {
    setIsDetecting(true);
    setLoadingMessage('Menganalisis makanan...');

    try {
      // Create temporary image element for detection
      const img = new Image();
      img.src = imageDataUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Run TensorFlow.js detection
      const detectedObjects = await detectFoods(img, {
        minConfidence: 0.5,
        filterFoodOnly: true,
      });

      console.log('[ObjectDetectionView] Detected objects:', detectedObjects);

      if (detectedObjects.length === 0) {
        throw new Error('Tidak ada makanan terdeteksi. Pastikan foto menampilkan makanan dengan jelas.');
      }

      // Map to DetectedFood with nutrition data
      const detectedFoods: DetectedFood[] = detectedObjects
        .map(obj => {
          const foodData = getFoodNutrition(obj.class);
          
          if (!foodData) {
            console.warn(`[ObjectDetectionView] No nutrition data for: ${obj.class}`);
            return null;
          }

          return {
            label: obj.class,
            indonesianName: foodData.indonesianName,
            confidence: obj.score,
            bbox: obj.bbox,
            nutritionData: foodData.nutritionData,
            servingSize: foodData.servingSize,
          };
        })
        .filter((food): food is DetectedFood => food !== null);

      if (detectedFoods.length === 0) {
        throw new Error('Makanan terdeteksi tapi data nutrisi tidak tersedia. Coba scan label gizi saja.');
      }

      console.log('[ObjectDetectionView] Mapped to nutrition data:', detectedFoods);

      // Show detected foods with bounding boxes on canvas
      if (canvasRef.current) {
        drawBoundingBoxes(img, detectedFoods);
      }

      // Trigger callback
      onDetectionComplete(detectedFoods);
    } catch (err) {
      console.error('[ObjectDetectionView] Detection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal mendeteksi makanan. Coba lagi.';
      setError(errorMessage);
      onError(new Error(errorMessage));
    } finally {
      setIsDetecting(false);
      setLoadingMessage('');
    }
  };

  // Draw bounding boxes on canvas
  const drawBoundingBoxes = (img: HTMLImageElement, detectedFoods: DetectedFood[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image
    ctx.drawImage(img, 0, 0);

    // Draw bounding boxes
    detectedFoods.forEach(food => {
      const [x, y, width, height] = food.bbox;
      
      // Determine color based on confidence
      const color = food.confidence > 0.7 ? '#10b981' : '#f59e0b'; // Green or amber
      
      // Draw box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      const label = `${food.indonesianName} (${(food.confidence * 100).toFixed(0)}%)`;
      ctx.font = '16px Arial';
      const textWidth = ctx.measureText(label).width;
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 25, textWidth + 10, 25);

      // Draw label text
      ctx.fillStyle = '#fff';
      ctx.fillText(label, x + 5, y - 7);
    });
  };

  // Toggle camera
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setCapturedImage(null);
  };

  // Retry after error
  const handleRetry = () => {
    setError('');
    setCapturedImage(null);
    setIsDetecting(false);
  };

  // Permission denied state
  if (hasPermission === false) {
    return (
      <div className="camera-container flex items-center justify-center">
        <div className="text-center px-6 max-w-md">
          <div className="text-6xl mb-4">📷</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Akses Kamera Diperlukan
          </h2>
          <p className="text-gray-300 mb-6">
            {error || 'Izinkan akses kamera untuk mendeteksi makanan.'}
          </p>
          <button
            onClick={() => setHasPermission(null)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (hasPermission === null) {
    return (
      <div className="camera-container flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Memuat kamera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container">
      {/* Show canvas with bounding boxes if image captured */}
      {capturedImage ? (
        <>
          <canvas
            ref={canvasRef}
            className="camera-video object-contain"
          />
          {/* Retry button overlay */}
          {!isDetecting && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={handleRetry}
                className="bg-gray-800 bg-opacity-75 text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-100 transition"
              >
                🔄 Foto Ulang
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Video Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
          />

          {/* Guide overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white border-dashed rounded-lg w-4/5 h-2/3 max-w-md max-h-96">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-3 py-1 rounded text-white text-sm">
                  Posisikan piring di dalam kotak
                </div>
              </div>
            </div>

            {/* Loading/Error message */}
            {(loadingMessage || error) && (
              <div className={`absolute top-4 left-4 right-4 px-4 py-3 rounded-lg ${
                error ? 'bg-red-500' : 'bg-blue-500'
              } bg-opacity-90 text-white`}>
                {error || loadingMessage}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 pb-8 pointer-events-auto">
            <div className="flex items-center justify-center gap-8">
              {/* Camera toggle */}
              <button
                onClick={toggleCamera}
                disabled={isDetecting}
                className="w-12 h-12 bg-gray-800 bg-opacity-75 rounded-full flex items-center justify-center text-white hover:bg-opacity-100 transition disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Capture button */}
              <button
                onClick={handleCapture}
                disabled={isDetecting}
                className="capture-button active:scale-95 transition-transform disabled:opacity-50"
              >
                {isDetecting ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto" />
                ) : (
                  <div className="w-14 h-14 bg-green-500 rounded-full m-auto" />
                )}
              </button>

              {/* Placeholder */}
              <div className="w-12 h-12" />
            </div>

            <p className="text-center text-white text-sm mt-4 drop-shadow-lg">
              🍽️ Foto piring untuk deteksi otomatis
            </p>
          </div>
        </>
      )}
    </div>
  );
}
