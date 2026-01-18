import { NextResponse } from 'next/server';

type ApiResponseOptions = {
  status?: number;
  headers?: Record<string, string>;
};

/**
 * Standardized Success Response
 * @param data - The payload to return
 * @param message - Optional human-readable message
 * @param options - Status code (default 200) and headers
 */
export function successResponse<T>(data: T | null = null, message?: string, options: ApiResponseOptions = {}) {
  const { status = 200, headers } = options;
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      ...data, // Spread data to top-level for backward compatibility if needed, though 'data' field is preferred
    },
    { status, headers }
  );
}

/**
 * Standardized Error Response
 * @param message - Error message
 * @param status - HTTP status code (default 400)
 * @param code - Optional error code string for client handling
 */
export function errorResponse(message: string, status: number = 400, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
    },
    { status }
  );
}
