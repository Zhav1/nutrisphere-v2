/**
 * Indonesian Food Calorie Database
 * Maps COCO-SSD object detection labels to Indonesian dishes with nutritional data
 * 
 * Data Sources:
 * - USDA FoodData Central
 * - Indonesian Food Composition Data (Kemenkes RI)
 * - Average values for standard portions
 */

import { NutritionalInfo } from '@/types/scan';

export interface FoodCalorieData {
  indonesianName: string;        // Name in Bahasa Indonesia
  englishName: string;            // Original COCO-SSD label
  nutritionData: NutritionalInfo; // Per standard serving
  servingSize: string;            // e.g., "1 medium banana (118g)"
  healthGrade: 'A' | 'B' | 'C' | 'D';
  notes?: string;                 // Additional context
}

/**
 * Calorie database mapping COCO-SSD labels to Indonesian foods
 * Each entry represents a standard serving size
 */
export const FOOD_CALORIE_MAP: Record<string, FoodCalorieData> = {
  // === Fruits ===
  'banana': {
    indonesianName: 'Pisang',
    englishName: 'Banana',
    nutritionData: {
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fat: 0.3,
      sugar: 12,
      sodium: 1,
    },
    servingSize: '1 buah sedang (118g)',
    healthGrade: 'A',
    notes: 'Sumber potasium dan energi cepat',
  },
  'apple': {
    indonesianName: 'Apel',
    englishName: 'Apple',
    nutritionData: {
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      sugar: 19,
      sodium: 2,
    },
    servingSize: '1 buah sedang (182g)',
    healthGrade: 'A',
    notes: 'Tinggi serat, rendah kalori',
  },
  'orange': {
    indonesianName: 'Jeruk',
    englishName: 'Orange',
    nutritionData: {
      calories: 62,
      protein: 1.2,
      carbs: 15,
      fat: 0.2,
      sugar: 12,
      sodium: 0,
    },
    servingSize: '1 buah sedang (131g)',
    healthGrade: 'A',
    notes: 'Tinggi vitamin C',
  },

  // === Vegetables ===
  'broccoli': {
    indonesianName: 'Brokoli',
    englishName: 'Broccoli',
    nutritionData: {
      calories: 55,
      protein: 3.7,
      carbs: 11,
      fat: 0.6,
      sugar: 2.2,
      sodium: 64,
    },
    servingSize: '1 mangkuk (156g)',
    healthGrade: 'A',
    notes: 'Superfood, tinggi vitamin K dan C',
  },
  'carrot': {
    indonesianName: 'Wortel',
    englishName: 'Carrot',
    nutritionData: {
      calories: 41,
      protein: 0.9,
      carbs: 10,
      fat: 0.2,
      sugar: 4.7,
      sodium: 69,
    },
    servingSize: '1 buah sedang (61g)',
    healthGrade: 'A',
    notes: 'Tinggi beta-karoten (vitamin A)',
  },

  // === Western Fast Food (Common in Indonesia) ===
  'pizza': {
    indonesianName: 'Pizza',
    englishName: 'Pizza',
    nutritionData: {
      calories: 285,
      protein: 12,
      carbs: 36,
      fat: 10,
      sugar: 4,
      sodium: 640,
    },
    servingSize: '1 slice (107g)',
    healthGrade: 'C',
    notes: 'Tinggi natrium, makan dalam porsi kecil',
  },
  'hot dog': {
    indonesianName: 'Hot Dog',
    englishName: 'Hot Dog',
    nutritionData: {
      calories: 314,
      protein: 11,
      carbs: 24,
      fat: 19,
      sugar: 5,
      sodium: 810,
    },
    servingSize: '1 porsi dengan roti (100g)',
    healthGrade: 'D',
    notes: 'Processed meat, tinggi natrium',
  },
  'sandwich': {
    indonesianName: 'Roti Isi',
    englishName: 'Sandwich',
    nutritionData: {
      calories: 250,
      protein: 10,
      carbs: 30,
      fat: 10,
      sugar: 4,
      sodium: 500,
    },
    servingSize: '1 porsi (120g)',
    healthGrade: 'B',
    notes: 'Tergantung isian, pilih yang pakai sayur',
  },

  // === Desserts ===
  'donut': {
    indonesianName: 'Donat',
    englishName: 'Donut',
    nutritionData: {
      calories: 269,
      protein: 3.6,
      carbs: 31,
      fat: 15,
      sugar: 12,
      sodium: 257,
    },
    servingSize: '1 buah (66g)',
    healthGrade: 'D',
    notes: 'Tinggi gula dan lemak trans',
  },
  'cake': {
    indonesianName: 'Kue/Cake',
    englishName: 'Cake',
    nutritionData: {
      calories: 257,
      protein: 3,
      carbs: 42,
      fat: 9,
      sugar: 28,
      sodium: 242,
    },
    servingSize: '1 potong (74g)',
    healthGrade: 'D',
    notes: 'Dessert, konsumsi sesekali',
  },

  // === Common Indonesian Foods (Estimated via Ingredients) ===
  // Note: COCO-SSD detects "bowl" which often contains rice/noodles
  'bowl': {
    indonesianName: 'Nasi Putih (estimasi)',
    englishName: 'Rice Bowl',
    nutritionData: {
      calories: 204,
      protein: 4.2,
      carbs: 45,
      fat: 0.4,
      sugar: 0,
      sodium: 2,
    },
    servingSize: '1 mangkuk (158g)',
    healthGrade: 'B',
    notes: 'Asumsi mangkuk berisi nasi putih',
  },

  // === Beverages (via bottle/cup/wine glass) ===
  'bottle': {
    indonesianName: 'Minuman Kemasan',
    englishName: 'Bottled Drink',
    nutritionData: {
      calories: 140,
      protein: 0,
      carbs: 39,
      fat: 0,
      sugar: 38,
      sodium: 45,
    },
    servingSize: '1 botol (355ml)',
    healthGrade: 'D',
    notes: 'Asumsi minuman bersoda/manis',
  },
  'cup': {
    indonesianName: 'Minuman dalam Gelas',
    englishName: 'Cup Drink',
    nutritionData: {
      calories: 90,
      protein: 0,
      carbs: 24,
      fat: 0,
      sugar: 23,
      sodium: 25,
    },
    servingSize: '1 gelas (240ml)',
    healthGrade: 'C',
    notes: 'Asumsi jus/teh manis',
  },
};

/**
 * Get nutrition data for a detected food item
 * @param cocoSsdLabel - Label from COCO-SSD (e.g., "banana")
 * @returns FoodCalorieData or null if not found
 */
export function getFoodNutrition(cocoSsdLabel: string): FoodCalorieData | null {
  const normalized = cocoSsdLabel.toLowerCase();
  return FOOD_CALORIE_MAP[normalized] || null;
}

/**
 * Get all available food labels
 * Useful for filtering COCO-SSD results
 */
export function getAvailableFoodLabels(): string[] {
  return Object.keys(FOOD_CALORIE_MAP);
}

/**
 * Calculate total nutrition from multiple detected foods
 * @param detectedFoods - Array of COCO-SSD labels
 * @returns Aggregated nutrition data
 */
export function calculateTotalNutrition(
  detectedFoods: string[]
): NutritionalInfo & { totalItems: number } {
  const totals: NutritionalInfo = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
    sodium: 0,
  };

  let validItems = 0;

  detectedFoods.forEach(label => {
    const foodData = getFoodNutrition(label);
    if (foodData) {
      totals.calories += foodData.nutritionData.calories;
      totals.protein += foodData.nutritionData.protein;
      totals.carbs += foodData.nutritionData.carbs;
      totals.fat += foodData.nutritionData.fat;
      totals.sugar += foodData.nutritionData.sugar;
      totals.sodium += foodData.nutritionData.sodium;
      validItems++;
    }
  });

  return {
    ...totals,
    totalItems: validItems,
  };
}
