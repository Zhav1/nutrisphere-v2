// CRITICAL: Required to prevent static rendering at build time
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { processNutritionLabel } from '@/services/visionService';

/**
 * POST /api/vision-analyze
 * Analyzes nutrition label image using Gemini Flash Lite (GA model)
 * 
 * @body imageData - Base64 data URL (data:image/jpeg;base64,...)
 * @returns Structured nutrition data with health grade
 */
export async function POST(request: NextRequest) {
  console.log('🚀 API HIT: vision-analyze called');
  
  try {
    const { imageData } = await request.json();
    console.log('📸 Image received, size:', imageData?.length || 0);
    
    if (!imageData || typeof imageData !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: imageData is required' },
        { status: 400 }
      );
    }

    // Validate data URL format
    if (!imageData.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid imageData format. Expected data URL (data:image/...)' },
        { status: 400 }
      );
    }
    
    console.log('🤖 Calling processNutritionLabel service...');
    const result = await processNutritionLabel(imageData);
    console.log('✅ Vision analysis complete');
    
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Vision Analyze API Error:', error);
    
    // Pass through specific error messages for better debugging
    const errorMessage = error?.message || 'Failed to process image';
    const statusCode = error?.message?.includes('rate limit') ? 429 : 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: statusCode }
    );
  }
}
