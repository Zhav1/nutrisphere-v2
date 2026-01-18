/**
 * Timeout Wrapper for AI Calls
 * 
 * Provides timeout-based fallback trigger for AI analysis calls.
 * When AI is too slow or fails, triggers fallback mode.
 */

// Default timeout for AI calls (8 seconds)
export const AI_TIMEOUT_MS = 8000;

// Timeout for recipe generation (longer due to complexity)
export const RECIPE_TIMEOUT_MS = 15000;

export type TimeoutResultSuccess<T> = {
  success: true;
  data: T;
};

export type TimeoutResultFailure = {
  success: false;
  reason: 'timeout' | 'error' | 'network';
  message: string;
  error?: Error;
};

export type TimeoutResult<T> = TimeoutResultSuccess<T> | TimeoutResultFailure;

/**
 * Wrap an async function with timeout
 * Returns fallback trigger if timeout exceeded
 */
export async function withTimeout<T>(
  asyncFn: () => Promise<T>,
  timeoutMs: number = AI_TIMEOUT_MS,
  operationName: string = 'AI analysis'
): Promise<TimeoutResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Race between the async function and timeout
    const result = await Promise.race([
      asyncFn(),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('TIMEOUT'));
        });
      }),
    ]);

    clearTimeout(timeoutId);
    return { success: true, data: result };
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Check if it's a timeout
    if (error?.message === 'TIMEOUT' || controller.signal.aborted) {
      return {
        success: false,
        reason: 'timeout',
        message: `${operationName} terlalu lama (>${timeoutMs / 1000}s). Silakan pilih dari daftar.`,
        error,
      };
    }

    // Check if it's a network error
    if (
      error?.name === 'TypeError' ||
      error?.message?.includes('network') ||
      error?.message?.includes('fetch') ||
      error?.message?.includes('Failed to fetch')
    ) {
      return {
        success: false,
        reason: 'network',
        message: 'Koneksi bermasalah. Coba lagi atau pilih dari daftar.',
        error,
      };
    }

    // Generic error
    return {
      success: false,
      reason: 'error',
      message: error?.message || 'Terjadi kesalahan. Silakan coba lagi.',
      error,
    };
  }
}

/**
 * Wrap fetch with timeout
 * Useful for API calls
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = AI_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error?.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Helper to determine if we should show fallback based on result
 */
export function shouldShowFallback<T>(result: TimeoutResult<T>): result is {
  success: false;
  reason: 'timeout' | 'error' | 'network';
  message: string;
  error?: Error;
} {
  return !result.success;
}

/**
 * Get user-friendly message for fallback reason
 */
export function getFallbackMessage(reason: 'timeout' | 'error' | 'network'): {
  title: string;
  message: string;
  icon: string;
} {
  switch (reason) {
    case 'timeout':
      return {
        title: 'Analisis Terlalu Lama',
        message: 'AI membutuhkan waktu terlalu lama. Pilih makanan dari daftar atau coba lagi.',
        icon: '⏱️',
      };
    case 'network':
      return {
        title: 'Masalah Koneksi',
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        icon: '📶',
      };
    case 'error':
    default:
      return {
        title: 'Terjadi Kesalahan',
        message: 'Maaf, ada yang tidak beres. Silakan coba lagi.',
        icon: '⚠️',
      };
  }
}
