'use client';

import { useEffect, useRef, useState } from 'react';
import { captureFrame, captureFrameRaw } from '@/lib/ai/imageUtils';
import BackButton from '@/components/ui/BackButton';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  isProcessing: boolean;
  onBack?: () => void;
  /** If true, captures raw image without preprocessing (for food detection). Default: false (OCR mode) */
  useRawCapture?: boolean;
}

export default function CameraView({ onCapture, isProcessing, onBack, useRawCapture = false }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Initialize camera
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initCamera() {
      try {
        // Request camera permission
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

        // Attach stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Camera initialization error:', err);
        setHasPermission(false);

        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setError('Akses kamera ditolak. Silakan izinkan akses kamera untuk memindai label.');
          } else if (err.name === 'NotFoundError') {
            setError('Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera.');
          } else {
            setError('Gagal mengakses kamera. Coba lagi.');
          }
        }
      }
    }

    initCamera();

    // Cleanup function
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Handle capture button click
  const handleCapture = () => {
    if (!videoRef.current || isProcessing) return;

    try {
      // Use raw capture for food detection (preserves color)
      // Use preprocessed capture for OCR/label reading
      const imageDataUrl = useRawCapture
        ? captureFrameRaw(videoRef.current)
        : captureFrame(videoRef.current);
      onCapture(imageDataUrl);
    } catch (err) {
      console.error('Capture error:', err);
      setError('Gagal mengambil foto. Coba lagi.');
    }
  };

  // Toggle between front and back camera
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Request permission again
  const requestPermission = () => {
    setHasPermission(null);
    setError('');
  };

  // Permission denied state
  if (hasPermission === false) {
    return (
      <div className="camera-container flex items-center justify-center">
        {/* Back Button */}
        {onBack && (
          <BackButton
            variant="dark"
            onClick={onBack}
            position="static"
          />
        )}
        <div className="text-center px-6 max-w-md">
          <div className="text-6xl mb-4">📷</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Akses Kamera Diperlukan
          </h2>
          <p className="text-gray-300 mb-6">
            {error || 'Izinkan akses kamera untuk memindai label gizi produk.'}
          </p>
          <button
            onClick={requestPermission}
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
        {/* Back Button */}
        {onBack && (
          <BackButton
            variant="dark"
            onClick={onBack}
            position="static"
          />
        )}
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Memuat kamera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container">
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-video"
      />

      {/* Overlay UI */}
      <div className="absolute inset-0">
        {/* Top Bar - Back Button with safe area */}
        {onBack && (
          <div className="absolute top-0 left-0 right-0 pt-safe-top p-4 md:p-6 pointer-events-auto z-20">
            <BackButton
              variant="dark"
              onClick={onBack}
              position="inline"
              label="Kembali"
            />
          </div>
        )}

        {/* Guide frame for label positioning */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[85%] h-[55%] max-w-md max-h-96">
            {/* Dashed border frame - more visible */}
            <div className="absolute inset-0 border-[3px] border-white/90 border-dashed rounded-2xl" />
            
            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
            
            {/* Hint text at BOTTOM of the box */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className="text-white text-sm font-medium whitespace-nowrap">
                📍 Posisikan label di dalam kotak
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute top-20 left-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl pointer-events-auto z-10">
            {error}
          </div>
        )}
      </div>

      {/* Controls - with extra bottom padding for Android nav bar */}
      <div className="absolute bottom-0 left-0 right-0 pb-20 md:pb-12 pointer-events-auto">
        <div className="flex items-center justify-center gap-8">
          {/* Camera toggle button */}
          <button
            onClick={toggleCamera}
            disabled={isProcessing}
            className="w-12 h-12 bg-gray-800 bg-opacity-75 rounded-full flex items-center justify-center text-white hover:bg-opacity-100 transition disabled:opacity-50"
            aria-label="Toggle camera"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {/* Capture button */}
          <button
            onClick={handleCapture}
            disabled={isProcessing}
            className="capture-button active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Capture photo"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto" />
            ) : (
              <div className="w-14 h-14 bg-green-500 rounded-full m-auto" />
            )}
          </button>

          {/* Placeholder for symmetry */}
          <div className="w-12 h-12" />
        </div>

        {/* Capture hint */}
        <p className="text-center text-white text-sm mt-4 drop-shadow-lg">
          📸 Ketuk untuk memindai
        </p>
      </div>
    </div>
  );
}
