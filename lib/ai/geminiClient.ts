import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { VisionScanResult } from '@/types/scan';
import { Recipe } from '@/types/recipe';

// =============================================================================
// GEMINI API KEY FAILOVER SYSTEM
// Supports multiple API keys with automatic failover when rate limits are hit
// =============================================================================

// Collect all available API keys from environment
const GEMINI_API_KEYS: string[] = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter((key): key is string => !!key && key.length > 0);

// Track which key index to try first (round-robin distribution)
let currentKeyIndex = 0;

/**
 * Check if an error is a rate limit error
 */
function isRateLimitError(error: any): boolean {
  const message = error?.message?.toLowerCase() || '';
  const status = error?.status || error?.statusCode;
  
  return (
    status === 429 ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('resource exhausted') ||
    message.includes('too many requests') ||
    message.includes('limit exceeded')
  );
}

/**
 * Get a Gemini client with automatic failover
 * Tries each API key in sequence until one works
 */
async function executeWithFailover<T>(
  operation: (model: GenerativeModel) => Promise<T>,
  modelName: string = 'gemini-2.5-flash',
  generationConfig?: object
): Promise<T> {
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured. Please set GEMINI_API_KEY in your environment.');
  }

  const keysToTry = GEMINI_API_KEYS.length;
  let lastError: any = null;

  // Try each key starting from the current index
  for (let i = 0; i < keysToTry; i++) {
    const keyIndex = (currentKeyIndex + i) % GEMINI_API_KEYS.length;
    const apiKey = GEMINI_API_KEYS[keyIndex];
    
    try {
      console.log(`[Gemini] Trying API key ${keyIndex + 1}/${GEMINI_API_KEYS.length}...`);
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel(
        { 
          model: modelName,
          ...(generationConfig ? { generationConfig } : {})
        },
        { apiVersion: 'v1beta' }
      );

      const result = await operation(model);
      
      // Success! Move to next key for next request (round-robin)
      currentKeyIndex = (keyIndex + 1) % GEMINI_API_KEYS.length;
      console.log(`[Gemini] ✅ Success with API key ${keyIndex + 1}`);
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      if (isRateLimitError(error)) {
        console.warn(`[Gemini] ⚠️ Rate limit hit on API key ${keyIndex + 1}, trying next key...`);
        continue; // Try next key
      }
      
      // For non-rate-limit errors, throw immediately
      console.error(`[Gemini] ❌ Error on API key ${keyIndex + 1}:`, error.message);
      throw error;
    }
  }

  // All keys exhausted
  console.error('[Gemini] ❌ All API keys exhausted!');
  throw new Error(
    `All ${GEMINI_API_KEYS.length} Gemini API keys have hit their rate limits. ` +
    `Please try again later or add more API keys. Last error: ${lastError?.message}`
  );
}

// Legacy single client for backward compatibility (uses first available key)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEYS[0] || '');

/**
 * System Prompt for Nutrition Vision Analyst (Gemini 2.5 Flash)
 * Multimodal analysis of nutrition labels with Zero Tolerance for Zero
 */
const NUTRITION_VISION_PROMPT = `# ROLE
You are a Multimodal Nutritionist API powered by Google Gemini 2.5 Flash.
Your input will be a Base64-encoded image of an Indonesian food product's nutrition label.

YOUR TASK:
1. ANALYZE the image using your vision capabilities (NOT OCR). Look directly at the nutrition table.
2. EXTRACT the following nutritional values in their numeric form:
   - Energy/Calories (in kcal)
   - Protein (in grams)
   - Fat/Lemak (in grams)
   - Carbohydrates/Karbohidrat (in grams)
   - Sugar/Gula (in grams)
   - Sodium/Natrium (in mg)

3. VALIDATE the image:
   - Set "is_valid_food" to TRUE if you can clearly see a nutrition label with numbers.
   - Set it to FALSE if the image is:
     * A person/selfie
     * A toy/doll
     * Blank/blurry
     * Not a food product

4. ZERO TOLERANCE FOR ZERO:
   - Do NOT output 0 for any value if you can see a number on the image.
   - If the label shows "3g" but it's slightly blurry, output 3, NOT 0.
   - ONLY output 0 if the label explicitly says "0" or the field is missing.

5. CALCULATE Health Grade (A=Healthiest to D=Unhealthy):
   CRITICAL: Be STRICT and CONTEXT-AWARE! Consider the entire nutritional profile and food type.
   
   **Grade D (Unhealthy - Red Flag):**
   - Sugar > 15g per serving
   - Sodium > 600mg per serving
   - Fat > 20g AND Protein < 3g (junk food indicator)
   - Saturated fat content high (e.g., chocolate, fried snacks)
   - ANY snack food (coklat, keripik, permen, biskuit krim) should default to D or C
   
   **Grade C (Hati-hati - Moderate Risk):**
   - Sugar 10-15g per serving
   - Sodium 400-600mg per serving
   - Carbs > 50g with Protein < 5g (empty carbs)
   - Processed snacks or desserts
   
   **Grade B (Cukup Baik - Acceptable):**
   - Sugar 5-10g per serving
   - Sodium 200-400mg per serving
   - Protein 5-10g (decent protein)
   - Balanced macros (not too high in any single nutrient)
   
   **Grade A (Sehat - Excellent):**
   - Sugar < 5g per serving
   - Sodium < 200mg per serving
   - Protein > 10g (high protein)
   - Low fat < 5g OR healthy fats
   - Nutrient-dense foods (eggs, fish, vegetables, fruits)
   
   **SPECIAL RULES:**
   - Protein = 0g → Maximum Grade C (even if sugar/sodium low)
   - Coklat/Chocolate → Maximum Grade C (regardless of low sugar claims)
   - Keripik/Chips → Maximum Grade C
   - Minuman manis → Maximum Grade D if sugar > 10g

6. GENERATE "laymanExplanation" in casual Bahasa Indonesia slang for students:
   - Use relatable comparisons (e.g., "Gula setara 3 sendok makan!")
   - Be encouraging for healthy products ("Mantap! Ini sehat banget!")
   - Be scary/warning for unhealthy products ("Waduh, natrium-nya gila!")
   - For snacks/chocolate: "Enak sih tapi jangan tiap hari ya, ini cemilan bukan makanan utama"


OUTPUT FORMAT (STRICT JSON ONLY, NO MARKDOWN):
{
  "isValidFood": boolean,
  "calories": number,
  "protein": number,
  "sugar": number,
  "sodium": number,
  "carbs": number,
  "fat": number,
  "healthGrade": "A" | "B" | "C" | "D",
  "laymanExplanation": "string in casual Indonesian"
}

CRITICAL RULES:
- Output ONLY valid JSON. No markdown code blocks, no explanations.
- If "isValidFood" is false, still output the JSON structure with all nutritional values set to 0.
- Always provide a "laymanExplanation" even if the image is invalid (e.g., "Ini bukan makanan bro, foto boneka aja kok discan 😅")

EXAMPLES:

Example 1 - Valid nutrition label:
Image shows: "Energi Total: 350 kkal, Protein: 12g, Lemak: 15g, Karbohidrat: 50g, Gula: 18g, Natrium: 800mg"
Output:
{
  "isValidFood": true,
  "calories": 350,
  "protein": 12,
  "sugar": 18,
  "sodium": 800,
  "carbs": 50,
  "fat": 15,
  "healthGrade": "D",
  "laymanExplanation": "Gula 18g setara 4.5 sendok makan! Natrium 800mg juga tinggi banget. Enak sih tapi jangan tiap hari ya."
}

Example 2 - Healthy product:
Image shows: "Energi: 100 kkal, Protein: 8g, Lemak: 3g, Karbohidrat: 10g, Gula: 2g, Natrium: 100mg"
Output:
{
  "isValidFood": true,
  "calories": 100,
  "protein": 8,
  "sugar": 2,
  "sodium": 100,
  "carbs": 10,
  "fat": 3,
  "healthGrade": "A",
  "laymanExplanation": "Mantap! Ini sehat banget. Gula cuma 2g, protein lumayan 8g. Cocok buat diet!"
}

Example 3 - Non-food item (doll):
Image shows: A Barbie doll in packaging
Output:
{
  "isValidFood": false,
  "calories": 0,
  "protein": 0,
  "sugar": 0,
  "sodium": 0,
  "carbs": 0,
  "fat": 0,
  "healthGrade": "D",
  "laymanExplanation": "Ini boneka bro, bukan makanan 😂 Scan label gizi di kemasan makanan/minuman ya!"
}`;

/**
 * System Prompt for Survival Chef (Gemini 2.5 Flash)
 * Generates budget-friendly recipes with Single-Use economy logic
 */
const SURVIVAL_CHEF_PROMPT = (budget: number, tools: string[]) => `You are 'Survival Chef', a master of cooking with extreme budget constraints for Indonesian students.

Constraints:
1. User Budget: ${budget} IDR.
2. Tools: ${tools.join(', ')} (e.g., Rice Cooker only).
3. Strategy: "Single-Use Economy". NEVER suggest buying bulk ingredients (e.g., do not say 'Buy 1 bottle of soy sauce', say 'Buy 1 sachet of soy sauce').
4. Target: Create a nutritious meal that fits the budget.

Task:
Generate a recipe JSON.
- Ingredients must be purchasable at a 'Warung' or 'Pasar' in small quantities (eceran).
- Estimate the price of the specific amount used.
- Calculate 'savingsVsBuyingRp': Compare your recipe cost vs buying the same dish at a restaurant (standard Indonesian pricing).

CRITICAL: Output STRICT JSON ONLY. No markdown, no conversation, no code blocks.

Schema:
{
  "title": "Recipe Name",
  "totalCostRp": number,
  "savingsVsBuyingRp": number,
  "calories": number,
  "protein": number,
  "ingredients": [
    {
      "name": "Ingredient Name",
      "qty": "2 pcs",
      "marketType": "retail" | "sachet" | "wet_market",
      "estimatedPriceRp": number
    }
  ],
  "steps": ["Step 1", "Step 2"],
  "isRiceCookerOnly": boolean,
  "toolsRequired": ["Rice Cooker"]
}`;

/**
 * Analyzes nutrition label from Base64 image using Gemini Vision
 * @param base64Image - Base64 string (without data URL prefix)
 * @returns Structured nutrition data with health grade
 */
export async function analyzeNutritionLabel(
  base64Image: string
): Promise<VisionScanResult> {
  console.log('[Gemini] Starting vision analysis with failover support...');

  return executeWithFailover(async (model) => {
    const result = await model.generateContent([
      NUTRITION_VISION_PROMPT,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('[Gemini] Raw response:', text.substring(0, 200));

    // Remove markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsedData = JSON.parse(cleanedText);

    console.log('[Gemini] Vision analysis complete:', {
      isValidFood: parsedData.isValidFood,
      calories: parsedData.calories,
      healthGrade: parsedData.healthGrade,
    });

    return {
      isValidFood: parsedData.isValidFood ?? true,
      nutritionData: {
        calories: parsedData.calories || 0,
        protein: parsedData.protein || 0,
        sugar: parsedData.sugar || 0,
        sodium: parsedData.sodium || 0,
        carbs: parsedData.carbs || 0,
        fat: parsedData.fat || 0,
      },
      healthGrade: parsedData.healthGrade || 'D',
      laymanExplanation:
        parsedData.laymanExplanation || 'Data nutrisi berhasil dibaca.',
    };
  }, 'gemini-2.5-flash');
}

/**
 * Generates a budget-friendly recipe using Gemini
 * @param budget - User budget in IDR
 * @param tools - Available cooking tools
 * @returns Recipe object
 */
export async function generateRecipe(
  budget: number,
  tools: string[]
): Promise<Recipe> {
  console.log('[Gemini] Generating recipe with failover support:', { budget, tools });

  return executeWithFailover(async (model) => {
    const result = await model.generateContent(
      SURVIVAL_CHEF_PROMPT(budget, tools)
    );

    const response = await result.response;
    const text = response.text();

    // Remove markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsedData = JSON.parse(cleanedText);

    console.log('[Gemini] Recipe generated:', parsedData.title);

    return parsedData;
  }, 'gemini-2.5-flash');
}

/**
 * System Prompt for Indonesian Food Plate Analysis
 * Uses Gemini Vision to identify and analyze Indonesian dishes
 */
const FOOD_PLATE_ANALYSIS_PROMPT = `# ROLE
You are an expert Indonesian Nutritionist and Chef with deep knowledge of traditional and modern Indonesian cuisine.
Your input will be an image of a food plate or meal.

YOUR TASK:
1. IDENTIFY the dish(es) with specific Indonesian names:
   - Use proper Indonesian names (e.g., "Nasi Goreng Spesial", "Rendang Daging Sapi", "Gado-Gado")
   - If it's a combination meal, list all components (e.g., "Nasi Putih + Ayam Goreng + Tempe + Sayur Asem")
   - Recognize regional variations (e.g., "Soto Betawi" vs "Soto Ayam")

2. IDENTIFY individual components:
   - List each component separately (e.g., ["Nasi Putih", "Telur Ceplok", "Kerupuk", "Sambal"])
   - Estimate the quantity for each component (e.g., "2 potong ayam", "1 centong nasi")

3. ESTIMATE PORTION SIZE:
   - Describe the overall portion (e.g., "1 piring penuh", "1 porsi sedang", "2 mangkok")
   - Consider Indonesian serving standards (1 centong nasi ≈ 100g, 1 potong ayam ≈ 100g)

4. CALCULATE NUTRITIONAL VALUES:
   Use these Indonesian food standards as reference:
   - Nasi Putih (100g): 130 kcal, 2.7g protein, 28g carbs, 0.3g fat
   - Ayam Goreng (100g): 250 kcal, 25g protein, 15g fat, 5g carbs
   - Rendang (100g): 300 kcal, 20g protein, 20g fat, 10g carbs
   - Tempe Goreng (50g): 100 kcal, 10g protein, 5g fat, 8g carbs
   - Tahu Goreng (50g): 80 kcal, 8g protein, 5g fat, 3g carbs
   - Telur (1 butir): 90 kcal, 6g protein, 7g fat, 0g carbs
   - Sayur Asem/Lodeh (100g): 50 kcal, 2g protein, 2g fat, 8g carbs
   - Sambal (1 sdm): 10 kcal, 0g protein, 0g fat, 2g carbs, 1g sugar
   - Kerupuk (10g): 50 kcal, 1g protein, 2g fat, 7g carbs

5. CALCULATE HEALTH GRADE (A=Healthiest to D=Unhealthy):
   **Grade A (Sehat Banget):**
   - High protein (>20g)
   - Balanced macros
   - Includes vegetables
   - Low in fried foods
   - Example: "Nasi + Ikan Bakar + Sayur + Tahu"
   
   **Grade B (Cukup Sehat):**
   - Moderate protein (10-20g)
   - Some vegetables present
   - Not too much fried food
   - Example: "Nasi + Ayam Goreng + Tempe + Sayur"
   
   **Grade C (Kurang Sehat):**
   - Low protein (<10g)
   - High carbs, low vegetables
   - Mostly fried foods
   - Example: "Nasi Goreng + Kerupuk (no vegetables)"
   
   **Grade D (Tidak Sehat):**
   - Very high fat (>30g)
   - No vegetables
   - All fried/processed foods
   - Excessive salt/sugar
   - Example: "Nasi + Ayam Goreng + Gorengan + Kerupuk (no vegetables)"

6. PROVIDE HEALTH TIPS:
   - Write in casual Bahasa Indonesia (Gen-Z friendly)
   - Keep it to ONE sentence max
   - Be encouraging for healthy meals: "Mantap! Protein tinggi, cocok buat diet!"
   - Be constructive for unhealthy meals: "Coba tambah sayur ya biar lebih seimbang!"
   - Reference specific improvements: "Gulanya agak tinggi, next time kurangin nasi dikit ya!"

OUTPUT FORMAT (STRICT JSON ONLY, NO MARKDOWN):
{
  "food_name": "Main dish name in Indonesian (e.g., 'Nasi Goreng Spesial')",
  "components": ["Component 1", "Component 2"],
  "components_detailed": [
    {
      "name": "Component name",
      "portion": "Portion estimate (e.g., '1 centong')",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "confidence": number (0-100, how sure you are about this component)
    }
  ],
  "portion_estimate": "Visual portion description (e.g., '1 piring penuh', '2 porsi sedang')",
  "calories": number (total estimated calories),
  "calories_confidence": number (0-100, your confidence in this estimate),
  "protein_g": number (total protein in grams),
  "protein_confidence": number (0-100),
  "carbs_g": number (total carbohydrates in grams),
  "carbs_confidence": number (0-100),
  "fat_g": number (total fat in grams),
  "fat_confidence": number (0-100),
  "sugar_g": number (total sugar in grams, estimate if not explicitly visible),
  "sodium_mg": number (estimated sodium in mg, Indonesian food tends to be salty),
  "health_grade": "A" | "B" | "C" | "D",
  "health_tips": "One sentence in casual Indonesian",
  "overall_confidence": number (0-100, overall confidence considering image quality and food clarity),
  "reasoning_notes": ["Note about uncertainty", "Another observation"] (optional, list any assumptions)
}

CRITICAL RULES:
- Output ONLY valid JSON. No markdown code blocks, no explanations.
- If the image is NOT food, set all nutritional values to 0 and health_tips to "Ini bukan makanan bro, foto makanan aja ya!"
- Always provide realistic estimates based on visual portion size
- Consider Indonesian portion sizes (we eat more rice than Western standards!)
- Be specific with food names - don't say "chicken rice", say "Nasi Ayam" or specific dish name

EXAMPLES:

Example 1 - Warteg Lunch:
Image shows: White rice, fried chicken, fried tempeh, and stir-fried vegetables
Output:
{
  "food_name": "Paket Warteg: Nasi + Ayam Goreng + Tempe + Tumis Sayur",
  "components": ["Nasi Putih (1.5 centong)", "Ayam Goreng (1 potong)", "Tempe Goreng (2 potong)", "Tumis Sayur (1 porsi)"],
  "portion_estimate": "1 piring penuh",
  "calories": 650,
  "protein_g": 35,
  "carbs_g": 70,
  "fat_g": 25,
  "sugar_g": 5,
  "sodium_mg": 800,
  "health_grade": "B",
  "health_tips": "Lumayan sehat nih! Protein oke, ada sayur juga. Mantap!"
}

Example 2 - Nasi Goreng:
Image shows: Fried rice with fried egg and crackers
Output:
{
  "food_name": "Nasi Goreng Telur + Kerupuk",
  "components": ["Nasi Goreng (1 piring)", "Telur Ceplok (1 butir)", "Kerupuk (5 keping)"],
  "portion_estimate": "1 piring sedang",
  "calories": 550,
  "protein_g": 18,
  "carbs_g": 75,
  "fat_g": 20,
  "sugar_g": 8,
  "sodium_mg": 1200,
  "health_grade": "C",
  "health_tips": "Enak sih tapi kurang sayur ya, coba next time tambah timun/tomat biar lebih sehat!"
}`;

/**
 * Interface for individual food component with nutrition breakdown
 */
export interface FoodComponent {
  name: string;
  portion: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence: number; // 0-100% confidence in detection
}

/**
 * Interface for Food Plate Analysis Result
 */
export interface FoodPlateAnalysis {
  food_name: string;
  category: 'Indonesian' | 'Western' | 'Asian' | 'Other' | 'Unknown';
  components?: string[]; // Legacy: simple string list (backward compat)
  components_detailed?: FoodComponent[]; // Detailed per-item nutrition
  portion_estimate: string;
  calories: number;
  calories_confidence?: number; // 0-100 per-field confidence
  protein_g: number;
  protein_confidence?: number;
  carbs_g: number;
  carbs_confidence?: number;
  fat_g: number;
  fat_confidence?: number;
  sugar_g: number;
  sodium_mg?: number;
  health_grade: 'A' | 'B' | 'C' | 'D';
  health_tips: string;
  fun_fact: string;
  overall_confidence?: number; // 0-100% overall detection confidence
  reasoning_notes?: string[]; // AI's notes about assumptions
  // Validation layer outputs (Phase 4)
  confidence?: 'high' | 'medium' | 'low'; // Validation confidence level
  confidenceLabel?: string; // Indonesian label ("Tinggi", "Sedang", "Rendah")
  validationWarnings?: string[]; // Warnings from validation layer
  wasValidated?: boolean; // Whether validation was performed
}

/**
 * Analyzes Indonesian food plate using Gemini Vision
 * @param base64Image - Base64 encoded image (without data URL prefix)
 * @returns Detailed food analysis with nutrition data
 */
export async function analyzeFoodPlate(
  base64Image: string
): Promise<FoodPlateAnalysis> {
  try {
    // Use gemini-2.5-flash for food plate analysis with JSON enforcement
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      // CRITICAL FIX: Force the model to output JSON, preventing plain text "explanations"
      generationConfig: { 
        responseMimeType: "application/json" 
      }
    }, {
      apiVersion: 'v1beta'
    });

    const prompt = `
You are an expert Indonesian Nutritionist with deep knowledge of traditional and modern Indonesian cuisine, as well as Western/global dishes.

YOUR TASK:
Analyze the food in this image accurately. Identify ALL food items visible and provide detailed nutrition for EACH component.

STRICT RULES:
1. Output MUST be valid JSON. Do not include markdown formatting or explanations.
2. Detect MULTIPLE food items if present (e.g., rice + chicken + vegetables = 3 items).
3. Provide confidence (0-100) for each detected item based on visual clarity.
4. If the image is blurry, too dark, unclear, or NOT food, return:
   {
     "food_name": "Tidak Terdeteksi",
     "category": "Unknown",
     "components_detailed": [],
     "portion_estimate": "-",
     "calories": 0,
     "protein_g": 0,
     "carbs_g": 0,
     "fat_g": 0,
     "sugar_g": 0,
     "health_grade": "D",
     "health_tips": "Foto kurang jelas. Coba cari tempat lebih terang dan foto ulang.",
     "fun_fact": "Tips: Pastikan makanan terlihat jelas dalam foto untuk hasil terbaik!",
     "overall_confidence": 0
   }

NUTRITION REFERENCE (per 100g):
- Nasi Putih: 130 kcal, 2.7g protein, 28g carbs, 0.3g fat
- Ayam Goreng: 250 kcal, 25g protein, 5g carbs, 15g fat
- Rendang: 300 kcal, 20g protein, 10g carbs, 20g fat
- Tempe Goreng: 200 kcal, 20g protein, 16g carbs, 8g fat
- Telur: 150 kcal, 13g protein, 1g carbs, 11g fat
- Sayur Tumis: 50 kcal, 2g protein, 8g carbs, 2g fat
- Biskuit/Cookies: 450 kcal, 6g protein, 65g carbs, 20g fat

JSON SCHEMA (strict):
{
  "food_name": "Main dish name (e.g., 'Nasi Padang Komplit' or 'Biskuit Marie')",
  "category": "Indonesian" | "Western" | "Asian" | "Other" | "Unknown",
  "components_detailed": [
    {
      "name": "Item name in Indonesian",
      "portion": "e.g., '1 centong', '1 potong', '2 keping'",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "confidence": number (0-100)
    }
  ],
  "portion_estimate": "Overall portion size description",
  "calories": number (TOTAL of all components),
  "protein_g": number (TOTAL),
  "carbs_g": number (TOTAL),
  "fat_g": number (TOTAL),
  "sugar_g": number (estimated),
  "health_grade": "A" | "B" | "C" | "D",
  "health_tips": "One short, practical health tip in Bahasa Indonesia",
  "fun_fact": "A short, fun fact about this dish in Bahasa Indonesia",
  "overall_confidence": number (0-100, average of all component confidences)
}

EXAMPLES:
1. Single item (biskuit): components_detailed has 1 item
2. Nasi Padang: components_detailed has 4-6 items (nasi, lauk, sayur, etc.)
3. Always ensure TOTAL calories = SUM of component calories
`;


    console.log('[Gemini] 🤖 Calling Gemini Model:', 'gemini-2.5-flash');
    console.log('[Gemini] Starting food plate analysis with Chain-of-Thought reasoning...');

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('[Gemini] Raw food analysis response:', text.substring(0, 200));

    try {
      // Clean potential markdown just in case, though MIME type should prevent it
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsedData: FoodPlateAnalysis = JSON.parse(cleanedText);

      console.log('[Gemini] Food plate analysis complete:', {
        foodName: parsedData.food_name,
        category: parsedData.category,
        calories: parsedData.calories,
        healthGrade: parsedData.health_grade,
      });

      return parsedData;
    } catch (parseError) {
      console.error('[Gemini] ⚠️ JSON Parse Error. Raw text:', text);
      console.error('[Gemini] Parse error details:', parseError);
      
      // Fallback if AI fails to return valid JSON
      return {
        food_name: "Gagal Memproses",
        category: "Unknown",
        portion_estimate: "-",
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        sugar_g: 0,
        health_grade: "D",
        health_tips: "Maaf, AI bingung membaca respon. Coba foto ulang dengan pencahayaan lebih baik.",
        fun_fact: "Foto yang jelas membantu AI memberikan analisis lebih akurat!"
      };
    }
  } catch (error: any) {
    console.error('[Gemini] Food plate analysis error:', error);

    // Handle specific Gemini API errors
    if (error?.message?.includes('API key')) {
      throw new Error(
        'Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.'
      );
    }

    if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
      throw new Error(
        'Gemini API rate limit exceeded. Please try again in a moment.'
      );
    }

    throw new Error('Failed to analyze food plate: ' + error?.message);
  }
}

