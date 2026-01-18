import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Recipe Generation Interface - includes all macronutrients
 */
export interface GroqRecipeOption {
  id: string;
  type: 'Hemat' | 'Balance' | 'Premium';
  title: string;
  description?: string;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  shopping_cost: number;
  savings_vs_buying: number;
  missing_ingredients: Array<{ item: string; qty: string; price: number; marketType: string }>;
  cooking_steps: string[];
  tools_required: string[];
  is_rice_cooker_only: boolean;
  // Budget validation fields
  exceeds_budget?: boolean;
  budget_warning?: string;
}

export interface GroqRecipeResponse {
  recipes: GroqRecipeOption[];
}

/**
 * CONDENSED Survival Chef Prompt (~1800 tokens vs original ~4000)
 * Optimized for better AI retention while keeping critical rules
 */
const buildRecipePrompt = (ingredients: string[], budget: number, tools: string[]) => {
  const hasRiceCooker = tools.includes('Rice Cooker');
  const hasStove = tools.includes('Stove');
  const isNoCook = tools.includes('No Cook');
  
  // Build tool-specific instructions
  let toolInstructions = '';
  if (isNoCook) {
    toolInstructions = `
⚠️ NO COOKING MODE - CRITICAL:
- NO heating, NO fire, NO rice cooker, NO stove, NO microwave
- Only allow: mixing, blending (cold), cutting, assembling
- Valid recipes: Salad, Sandwich, Smoothie, Overnight Oats, Cold Noodles, Wraps
- Steps must use: "campur", "aduk", "iris", "blender dingin", "tuang", "susun"
- FORBIDDEN words: "masak", "goreng", "rebus", "kukus", "panaskan", "api", "kompor", "rice cooker"`;
  } else if (hasRiceCooker && !hasStove) {
    toolInstructions = `Rice Cooker ONLY: NO "api", "wajan", "teflon". Use "tombol Cook", "mode Warm"`;
  } else if (hasStove) {
    toolInstructions = `Stove: USE "api kecil/sedang/besar", "wajan", "teflon"`;
  }
  
  // No Cook specific recipe examples
  const noCookExamples = isNoCook ? `
VALID NO-COOK RECIPE IDEAS:
- Salad Sayur Segar, Fruit Bowl, Gado-Gado Dingin
- Sandwich Telur Rebus (pre-boiled), Roti Isi Kornet
- Smoothie Bowl, Overnight Oats, Yogurt Parfait
- Cold Soba Noodles, Asinan, Rujak
- Lumpia Basah, Spring Roll
` : '';
  
  return `You are Survival Chef, an Indonesian cooking instructor for budget-conscious students.

INPUT:
- Pantry (FREE): ${ingredients.length > 0 ? ingredients.join(", ") : "Kosong"}
- Budget: Rp ${budget.toLocaleString('id-ID')} (for buying MISSING items only)
- Tools: ${tools.join(", ")}

CRITICAL RULES (MUST OBEY):
1. Generate EXACTLY 3 recipes: 1 Hemat (≤20% budget), 1 Balance (~50%), 1 Premium (80-100%)
2. ${toolInstructions}
3. Each recipe: 5-7 detailed steps with timing + visual cues
4. savings_vs_buying MUST be >= 1000 (compare to restaurant price)
5. Use 2024 Indonesian market prices (realistic, not cheap hallucinations)
6. Recipe names: Modern & catchy (e.g., "Crispy Garlic Egg Rice", not "Nasi Goreng Telur")
${noCookExamples}
JSON SCHEMA (strict):
{
  "recipes": [
    {
      "id": "hemat-1",
      "type": "Hemat" | "Balance" | "Premium",
      "title": "Modern Recipe Name",
      "description": "Short appetizing description",
      "total_calories": number,
      "total_protein": number,
      "total_fat": number,
      "total_carbs": number,
      "shopping_cost": number (ONLY items to BUY, pantry is FREE),
      "savings_vs_buying": number (>= 1000, restaurant price minus your cost),
      "missing_ingredients": [
        {"item": "Ingredient", "qty": "2 butir", "price": 3000, "marketType": "sachet|retail|wet_market"}
      ],
      "cooking_steps": [
        ${isNoCook 
          ? '"Step 1: Cuci bersih sayuran, tiriskan...", "Step 2: Iris timun tipis-tipis...", "Step 3: Campur semua bahan dalam mangkuk..."'
          : hasRiceCooker && !hasStove 
            ? '"Step 1: Cuci bersih bahan, potong seukuran 3-4cm...", "Step 2: Olesi Rice Cooker dengan minyak, tekan Cook..."'
            : '"Step 1: Cuci bersih bahan, potong seukuran 3-4cm...", "Step 2: Panaskan wajan dengan api sedang..."'
        }
      ],
      "tools_required": ${isNoCook ? '["Pisau", "Talenan", "Mangkuk"]' : '["Rice Cooker"]'},
      "is_rice_cooker_only": ${!isNoCook && hasRiceCooker && !hasStove ? 'true' : 'false'}
    }
  ]
}

PRICING GUIDE (2024 Indonesia):
- Telur: Rp 2,500/butir | Mie Instan: Rp 3,500 | Tempe 100g: Rp 3,000
- Ayam 100g: Rp 8,000 | Beras 100g: Rp 2,000 | Sayur 100g: Rp 3,000
- Sachet kecap/saus: Rp 1,000-2,000

MACROS GUIDE (per 100g):
- Nasi: 130kcal, 3g protein, 0g fat, 28g carbs
- Telur: 155kcal, 13g protein, 11g fat, 1g carbs  
- Ayam goreng: 250kcal, 25g protein, 15g fat, 5g carbs
- Tempe: 200kcal, 20g protein, 8g fat, 8g carbs
- Mi instan: 450kcal, 8g protein, 18g fat, 60g carbs

OUTPUT: Valid JSON only. No markdown, no explanation.`;
};

/**
 * Generates 3 recipe options (Hemat/Balance/Premium) using Groq
 * 
 * @param ingredients - Items user already has (free)
 * @param budget - Budget in IDR for buying missing ingredients
 * @param tools - Available cooking tools
 * @param retryCount - Internal retry counter
 * @returns 3 recipe options with different price points
 */
export async function generateRecipesWithGroq(
  ingredients: string[],
  budget: number,
  tools: string[],
  retryCount: number = 0
): Promise<GroqRecipeResponse> {
  const MAX_RETRIES = 1;

  try {
    console.log('[Groq] 🍳 Generating recipes with condensed prompt...');
    console.log('[Groq] Pantry:', ingredients);
    console.log('[Groq] Budget:', budget);
    console.log('[Groq] Tools:', tools);

    const prompt = buildRecipePrompt(ingredients, budget, tools);
    console.log('[Groq] Prompt length:', prompt.length, 'chars');

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile", // Upgraded from 17B for better reasoning
      temperature: 0.6,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from Groq");
    }

    // Parse JSON with repair attempts
    let parsedData: GroqRecipeResponse;
    try {
      parsedData = JSON.parse(content);
    } catch (parseError) {
      console.warn('[Groq] JSON parse failed, attempting repair...');
      
      // Repair strategies
      let repairedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/}\s*{/g, '}, {')
        .replace(/"\s*[\r\n]+\s*"/g, '", "');

      const jsonMatch = repairedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        repairedContent = jsonMatch[0];
      }

      try {
        parsedData = JSON.parse(repairedContent);
        console.log('[Groq] ✅ JSON repair successful');
      } catch {
        throw new Error('Failed to parse recipe JSON after repair');
      }
    }

    // Validate we got exactly 3 recipes
    if (!parsedData.recipes || parsedData.recipes.length < 3) {
      console.warn(`[Groq] ⚠️ Only ${parsedData.recipes?.length || 0} recipes returned`);
      
      if (retryCount < MAX_RETRIES) {
        console.log('[Groq] 🔄 Retrying recipe generation...');
        return generateRecipesWithGroq(ingredients, budget, tools, retryCount + 1);
      }
      
      throw new Error('AI sedang sibuk. Coba lagi dalam beberapa detik ya!');
    }

    // Post-process: ensure all required fields have valid values
    parsedData.recipes = parsedData.recipes.map((recipe, idx) => {
      // FIX: Calculate shopping_cost from actual ingredients sum (AI often hallucinates)
      const calculatedCost = (recipe.missing_ingredients || []).reduce(
        (sum, ing) => sum + (ing.price || 0), 
        0
      );
      
      const actualShoppingCost = calculatedCost > 0 ? calculatedCost : (recipe.shopping_cost || 0);
      
      // Log if there's a mismatch
      if (recipe.shopping_cost && Math.abs(recipe.shopping_cost - calculatedCost) > 1000) {
        console.warn(`[Groq] ⚠️ ${recipe.type}: shopping_cost mismatch! AI said Rp ${recipe.shopping_cost}, ingredients sum to Rp ${calculatedCost}. Using: ${actualShoppingCost}`);
      }
      
      // SIMPLIFIED SAVINGS: Budget minus actual ingredient cost
      // This is more intuitive - shows how much of your budget you're saving
      const finalSavings = Math.max(0, budget - actualShoppingCost);
      
      console.log(`[Groq] ${recipe.type}: Cost ${actualShoppingCost}, Budget ${budget}, Savings ${finalSavings}`);
      
      
      // BUDGET VALIDATION: Check if recipe exceeds budget
      // FIX: Only flag as "Melebihi Budget" if it strictly exceeds the TOTAL budget.
      // Percentage targets (Hemat=50%) are just AI guidelines, not hard limits for the user.
      const exceedsBudget = actualShoppingCost > budget;
      
      if (exceedsBudget) {
        console.warn(`[Groq] ⚠️ ${recipe.type} EXCEEDS BUDGET! Cost: Rp ${actualShoppingCost} > Budget: Rp ${budget}`);
      }
      
      return {
        ...recipe,
        id: recipe.id || `recipe-${idx}`,
        total_calories: recipe.total_calories || 0,
        total_protein: recipe.total_protein || 0,
        total_fat: recipe.total_fat || 0,
        total_carbs: recipe.total_carbs || 0,
        shopping_cost: actualShoppingCost, // Use calculated sum
        savings_vs_buying: finalSavings, // Use realistic savings (cost × 1 based on 2x markup)
        missing_ingredients: recipe.missing_ingredients || [],
        cooking_steps: recipe.cooking_steps || [],
        tools_required: recipe.tools_required || tools,
        is_rice_cooker_only: recipe.is_rice_cooker_only ?? (tools.includes('Rice Cooker') && !tools.includes('Stove')),
        // Budget validation fields for UI display
        exceeds_budget: exceedsBudget,
        budget_warning: exceedsBudget 
          ? `Melebihi budget! (Rp ${actualShoppingCost.toLocaleString('id-ID')} > Rp ${budget.toLocaleString('id-ID')})`
          : undefined,
      };
    });

    console.log(`[Groq] ✅ Generated ${parsedData.recipes.length} recipes (Budget: Rp ${budget})`);
    parsedData.recipes.forEach(r => {
      const budgetPercent = Math.round((r.shopping_cost / budget) * 100);
      console.log(`  - ${r.type}: ${r.title} (Rp ${r.shopping_cost} = ${budgetPercent}% of budget, saves Rp ${r.savings_vs_buying})`);
    });

    return parsedData;

  } catch (error: any) {
    console.error('[Groq] Recipe generation error:', error);

    if (error?.message?.includes('API key')) {
      throw new Error('Konfigurasi API bermasalah. Hubungi admin.');
    }

    if (error?.message?.includes('rate limit') || error?.message?.includes('quota')) {
      throw new Error('Server sibuk, coba lagi dalam 30 detik.');
    }

    throw new Error(error?.message || 'Gagal generate resep. Coba lagi ya!');
  }
}
