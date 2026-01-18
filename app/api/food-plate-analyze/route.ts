// CRITICAL: Required to prevent static rendering at build time
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { processFoodPlate } from '@/services/foodPlateService';
import { validateFoodNutrition, getConfidenceLabel } from '@/lib/validation/nutritionValidator';
import { initializeKnowledgeBase } from '@/lib/knowledge';

// Initialize knowledge base on first request
let knowledgeInitialized = false;

/**
 * POST /api/food-plate-analyze
 * Analyzes Indonesian food plate using Gemini Vision
 * + Layer 3: Validates nutrition against knowledge base
 * 
 * @body imageData - Base64 data URL (data:image/jpeg;base64,...)
 * @returns Detailed food analysis with Indonesian dish recognition, nutrition, and confidence
 */
export async function POST(request: NextRequest) {
  console.log('🚀 API HIT: food-plate-analyze called');
  
  try {
    // Lazy initialize knowledge base
    if (!knowledgeInitialized) {
      try {
        await initializeKnowledgeBase();
        knowledgeInitialized = true;
      } catch (e) {
        console.warn('[API] Knowledge base init failed, continuing without validation');
      }
    }

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
    
    // === LAYER 3: VALIDATION ===
    let validationResult = null;
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    let warnings: string[] = [];
    
    try {
      validationResult = validateFoodNutrition(result.food_name, {
        calories: result.calories || 0,
        protein: result.protein_g || 0,
        carbs: result.carbs_g || 0,
        fat: result.fat_g || 0,
        sugar: result.sugar_g || 0,
        sodium: result.sodium_mg || 0,
      });
      
      confidence = validationResult.confidence;
      warnings = validationResult.warnings;
      
      // Apply validated (potentially repaired) values
      if (validationResult.validatedData) {
        result.calories = validationResult.validatedData.calories;
        result.protein_g = validationResult.validatedData.protein;
        result.carbs_g = validationResult.validatedData.carbs;
        result.fat_g = validationResult.validatedData.fat;
      }
      
      console.log(`📊 Validation: confidence=${confidence}, issues=${validationResult.issues.length}`);
    } catch (validationError) {
      console.warn('[API] Validation error, returning unvalidated result:', validationError);
    }
    
    // Add confidence and warnings to response
    const confidenceLabel = getConfidenceLabel(confidence);
    
    return NextResponse.json({
      ...result,
      confidence,
      confidenceLabel: confidenceLabel.label,
      validationWarnings: warnings,
      wasValidated: validationResult !== null,
    });
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
