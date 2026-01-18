// CRITICAL: Required to prevent static rendering at build time
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { generateRecipesWithGroq, GroqRecipeResponse } from '@/lib/ai/groqClient';
import { validateRecipeRequest, sanitizeIngredient } from '@/lib/ai/promptGuard';

/**
 * POST /api/generate-recipe
 * Generates 3 budget-friendly recipe options using Groq (llama-4-scout)
 * Now with Prompt Guard validation for security!
 */
export async function POST(request: NextRequest) {
  try {
    const { ingredients, budget, tools } = await request.json();
    
    // Validate budget
    if (!budget || typeof budget !== 'number' || budget <= 0) {
      return NextResponse.json(
        { error: 'Budget harus berupa angka positif' },
        { status: 400 }
      );
    }

    if (budget < 5000) {
      return NextResponse.json(
        { error: 'Budget minimal Rp 5.000 ya!' },
        { status: 400 }
      );
    }
    
    // Ensure tools is an array
    const toolsArray = Array.isArray(tools) ? tools : [tools || 'Rice Cooker'];
    
    if (toolsArray.length === 0) {
      return NextResponse.json(
        { error: 'Pilih minimal 1 alat masak' },
        { status: 400 }
      );
    }
    
    // Sanitize and validate ingredients
    const ingredientsArray = Array.isArray(ingredients) 
      ? ingredients.map(sanitizeIngredient).filter(Boolean)
      : [];

    console.log('[API] 🚀 Generate Recipe Request:', {
      ingredients: ingredientsArray,
      budget,
      tools: toolsArray,
    });

    // 🛡️ PROMPT GUARD: Validate user input before AI call
    const guardResult = await validateRecipeRequest(ingredientsArray, budget, toolsArray);
    
    if (!guardResult.safe) {
      console.log('[API] 🚫 Prompt Guard rejected:', guardResult.message);
      return NextResponse.json(
        { error: guardResult.message || 'Input tidak valid' },
        { status: 400 }
      );
    }
    
    console.log('[API] ✅ Prompt Guard passed');
    
    // Call Groq for recipe generation
    const recipeResponse: GroqRecipeResponse = await generateRecipesWithGroq(
      ingredientsArray,
      budget,
      toolsArray
    );

    // Validate we got 3 recipes
    if (!recipeResponse.recipes || recipeResponse.recipes.length < 3) {
      console.error('[API] ❌ Less than 3 recipes returned');
      return NextResponse.json(
        { error: 'AI sedang sibuk, coba lagi dalam beberapa detik' },
        { status: 503 }
      );
    }

    console.log(`[API] ✅ Generated ${recipeResponse.recipes.length} recipe options`);
    
    return NextResponse.json(recipeResponse);
  } catch (error: any) {
    console.error('[API] Recipe Generation Error:', error);
    
    const errorMessage = error?.message || 'Gagal generate resep';
    const statusCode = error?.message?.includes('rate limit') ? 429 
      : error?.message?.includes('sibuk') ? 503 
      : 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: statusCode }
    );
  }
}

