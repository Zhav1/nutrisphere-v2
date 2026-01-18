'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, Check, Package } from 'lucide-react';

interface BarcodeResult {
  barcode: string;
  format: string;
  productName?: string;
  brand?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  imageUrl?: string;
}

interface BarcodeScannerProps {
  onResult: (result: BarcodeResult) => void;
  onBack: () => void;
}

/**
 * Barcode Scanner Component using native Barcode Detection API
 * Falls back to manual entry if API not supported
 */
export default function BarcodeScanner({ onResult, onBack }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if Barcode Detection API is supported
  useEffect(() => {
    // @ts-ignore - Barcode Detection API types
    if (!('BarcodeDetector' in window)) {
      setIsSupported(false);
      setError('Browser tidak mendukung barcode scanner. Gunakan input manual.');
    }
  }, []);

  // Initialize camera
  useEffect(() => {
    if (!isSupported) return;

    let currentStream: MediaStream | null = null;

    async function initCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        currentStream = mediaStream;
        setStream(mediaStream);
        setError('');

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Camera initialization error:', err);
        setError('Gagal mengakses kamera. Gunakan input manual di bawah.');
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [isSupported]);

  // Start barcode scanning
  useEffect(() => {
    if (!isSupported || !stream || !videoRef.current) return;

    // @ts-ignore - Barcode Detection API
    const barcodeDetector = new window.BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
    });

    const scan = async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      try {
        const barcodes = await barcodeDetector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const barcode = barcodes[0];
          if (barcode.rawValue !== lastScannedCode) {
            setLastScannedCode(barcode.rawValue);
            handleBarcodeDetected(barcode.rawValue, barcode.format);
          }
        }
      } catch (err) {
        // Silently ignore scan errors
      }
    };

    scanIntervalRef.current = setInterval(scan, 200);
    setIsScanning(true);

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [stream, isSupported, lastScannedCode]);

  // Handle barcode detection - fetch from Open Food Facts
  const handleBarcodeDetected = useCallback(async (barcode: string, format: string) => {
    setIsLoading(true);
    
    try {
      // Fetch from Open Food Facts API
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
      );
      
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const product = data.product;
        const nutriments = product.nutriments || {};
        
        const result: BarcodeResult = {
          barcode,
          format,
          productName: product.product_name || product.product_name_en || 'Unknown Product',
          brand: product.brands || undefined,
          calories: nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0,
          protein: nutriments.proteins_100g || 0,
          carbs: nutriments.carbohydrates_100g || 0,
          fat: nutriments.fat_100g || 0,
          imageUrl: product.image_front_small_url || product.image_url || undefined,
        };
        
        onResult(result);
      } else {
        // Product not found in database
        onResult({
          barcode,
          format,
          productName: `Produk tidak ditemukan (${barcode})`,
        });
      }
    } catch (err) {
      console.error('Error fetching product info:', err);
      onResult({
        barcode,
        format,
        productName: `Error: ${barcode}`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [onResult]);

  // Handle manual barcode entry
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.length >= 8) {
      handleBarcodeDetected(manualBarcode, 'manual');
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Kembali</span>
      </button>

      {/* Video Stream */}
      {isSupported && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-[60vh] object-cover"
        />
      )}

      {/* Scanning Overlay */}
      {isSupported && stream && (
        <div className="absolute inset-0 h-[60vh] pointer-events-none flex items-center justify-center">
          <motion.div
            className="w-64 h-32 border-2 border-green-400 rounded-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded text-white text-sm flex items-center gap-2">
              {isScanning && <Loader2 className="w-4 h-4 animate-spin" />}
              Arahkan ke barcode
            </div>
          </motion.div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40">
          <div className="text-center text-white">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p>Mencari produk...</p>
          </div>
        </div>
      )}

      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Package className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Barcode Scanner</h3>
            <p className="text-sm text-gray-500">
              Scan barcode produk makanan
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{error}</p>
          </div>
        )}

        {/* Manual Entry Form */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Input Manual Barcode
            </label>
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value.replace(/\D/g, ''))}
              placeholder="Contoh: 8991102220149"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              maxLength={14}
            />
          </div>
          <button
            type="submit"
            disabled={manualBarcode.length < 8 || isLoading}
            className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <Check className="w-5 h-5" />
            Cari Produk
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Data dari Open Food Facts database
        </p>
      </div>
    </div>
  );
}
