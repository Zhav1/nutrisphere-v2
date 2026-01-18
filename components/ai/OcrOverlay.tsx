'use client';

import AILoadingAnimation from '@/components/ui/AILoadingAnimation';

interface OcrOverlayProps {
  stage: 'idle' | 'processing_vision' | 'complete' | 'error';
  errorMessage?: string;
  onRetry?: () => void;
  type?: 'label' | 'food';
}

/**
 * OcrOverlay - Loading overlay for Scanners
 * Now uses the engaging AILoadingAnimation component
 */
export default function OcrOverlay({ stage, errorMessage, onRetry, type = 'label' }: OcrOverlayProps) {
  return (
    <AILoadingAnimation
      stage={stage}
      errorMessage={errorMessage}
      onRetry={onRetry}
      type={type}
    />
  );
}

