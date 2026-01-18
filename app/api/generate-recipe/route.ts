// CRITICAL: Required to prevent static rendering at build time
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { generateRecipesWithGroq, GroqRecipeResponse } from '@/lib/ai/groqClient';
import { validateRecipeRequest, sanitizeIngredient } from '@/lib/ai/promptGuard';
import { validateRecipe, getRecipeConfidenceLabel } from '@/lib/validation/recipeValidator';
import { initializeKnowledgeBase } from '@/lib/knowledge';

// Initialize knowledge base on first request
let knowledgeInitialized = false;

/**
 * POST /api/generate-recipe
 * Generates 3 budget-friendly recipe options using Groq (llama-4-scout)
 * Now with Prompt Guard validation for security!
 */
export async function POST(request: NextRequest) {
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

    // === LAYER 3: RECIPE VALIDATION ===
    const validatedRecipes = await Promise.all(
      recipeResponse.recipes.map(async (recipe) => {
        try {
          const validation = await validateRecipe(
            {
              title: recipe.title,
              totalCostRp: recipe.shopping_cost,
              savingsVsBuyingRp: recipe.savings_vs_buying,
              ingredients: recipe.missing_ingredients.map(ing => ({
                item: ing.item,
                qty: ing.qty,
                price: ing.price,
              })),
              cookingSteps: recipe.cooking_steps,
              calories: (recipe as any).calories,
              protein: (recipe as any).protein,
            },
            toolsArray
          );

          const confidenceLabel = getRecipeConfidenceLabel(validation.confidence);

          return {
            ...recipe,
            validation: {
              confidence: validation.confidence,
              confidenceLabel: confidenceLabel.label,
              isValid: validation.isValid,
              warnings: validation.warnings,
            },
          };
        } catch (e) {
          // If validation fails, return recipe without validation
          console.warn('[API] Recipe validation failed for:', recipe.title, e);
          return recipe;
        }
      })
    );
    
    return NextResponse.json({
      ...recipeResponse,
      recipes: validatedRecipes,
    });
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

