// CRITICAL: Required to prevent static rendering at build time
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { processFoodPlate } from '@/services/foodPlateService';

/**
 * POST /api/food-plate-analyze
 * Analyzes Indonesian food plate using Gemini Vision
 * 
 * @body imageData - Base64 data URL (data:image/jpeg;base64,...)
 * @returns Detailed food analysis with Indonesian dish recognition and nutrition
 */
export async function POST(request: NextRequest) {
  console.log('🚀 API HIT: food-plate-analyze called');
  
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
    
    console.log('🤖 Calling processFoodPlate service...');
    const result = await processFoodPlate(imageData);
    console.log('✅ Food plate analysis complete:', result.food_name);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Food Plate Analyze API Error:', error);
    
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
