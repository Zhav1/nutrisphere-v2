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
  // =========================================================================
  // INDONESIAN STAPLES (Makanan Pokok)
  // =========================================================================
  'nasi_putih': {
    indonesianName: 'Nasi Putih',
    englishName: 'White Rice',
    nutritionData: {
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fat: 0.3,
      sugar: 0,
      sodium: 2,
    },
    servingSize: '1 centong (100g)',
    healthGrade: 'B',
    notes: 'Makanan pokok Indonesia',
  },
  'nasi_goreng': {
    indonesianName: 'Nasi Goreng',
    englishName: 'Fried Rice',
    nutritionData: {
      calories: 350,
      protein: 10,
      carbs: 45,
      fat: 14,
      sugar: 3,
      sodium: 850,
    },
    servingSize: '1 piring (250g)',
    healthGrade: 'C',
    notes: 'Tinggi sodium dari kecap dan MSG',
  },
  'mie_goreng': {
    indonesianName: 'Mie Goreng',
    englishName: 'Fried Noodles',
    nutritionData: {
      calories: 400,
      protein: 12,
      carbs: 52,
      fat: 16,
      sugar: 4,
      sodium: 900,
    },
    servingSize: '1 piring (220g)',
    healthGrade: 'C',
    notes: 'Tinggi kalori dan sodium',
  },
  'mie_instan': {
    indonesianName: 'Mie Instan',
    englishName: 'Instant Noodles',
    nutritionData: {
      calories: 380,
      protein: 8,
      carbs: 52,
      fat: 14,
      sugar: 4,
      sodium: 1600,
    },
    servingSize: '1 bungkus (85g)',
    healthGrade: 'D',
    notes: 'Sangat tinggi sodium, konsumsi sesekali',
  },
  'bubur_ayam': {
    indonesianName: 'Bubur Ayam',
    englishName: 'Chicken Porridge',
    nutritionData: {
      calories: 280,
      protein: 15,
      carbs: 35,
      fat: 9,
      sugar: 2,
      sodium: 600,
    },
    servingSize: '1 mangkuk (350g)',
    healthGrade: 'B',
    notes: 'Mudah dicerna, protein cukup',
  },
  'lontong': {
    indonesianName: 'Lontong',
    englishName: 'Rice Cake',
    nutritionData: {
      calories: 150,
      protein: 3,
      carbs: 33,
      fat: 0.5,
      sugar: 0,
      sodium: 5,
    },
    servingSize: '1 porsi (100g)',
    healthGrade: 'B',
    notes: 'Karbohidrat padat',
  },

  // =========================================================================
  // INDONESIAN PROTEINS (Lauk Pauk)
  // =========================================================================
  'ayam_goreng': {
    indonesianName: 'Ayam Goreng',
    englishName: 'Fried Chicken',
    nutritionData: {
      calories: 250,
      protein: 25,
      carbs: 5,
      fat: 15,
      sugar: 0,
      sodium: 450,
    },
    servingSize: '1 potong paha (100g)',
    healthGrade: 'B',
    notes: 'Protein tinggi, lemak dari gorengan',
  },
  'ayam_bakar': {
    indonesianName: 'Ayam Bakar',
    englishName: 'Grilled Chicken',
    nutritionData: {
      calories: 200,
      protein: 28,
      carbs: 3,
      fat: 9,
      sugar: 2,
      sodium: 380,
    },
    servingSize: '1 potong paha (100g)',
    healthGrade: 'A',
    notes: 'Lebih sehat dari goreng',
  },
  'rendang': {
    indonesianName: 'Rendang',
    englishName: 'Beef Rendang',
    nutritionData: {
      calories: 300,
      protein: 20,
      carbs: 10,
      fat: 20,
      sugar: 3,
      sodium: 500,
    },
    servingSize: '1 porsi (80g)',
    healthGrade: 'B',
    notes: 'Protein tinggi, lemak dari santan',
  },
  'telur_ceplok': {
    indonesianName: 'Telur Ceplok',
    englishName: 'Fried Egg',
    nutritionData: {
      calories: 120,
      protein: 7,
      carbs: 1,
      fat: 10,
      sugar: 0,
      sodium: 180,
    },
    servingSize: '1 butir (50g)',
    healthGrade: 'B',
    notes: 'Sumber protein murah',
  },
  'telur_balado': {
    indonesianName: 'Telur Balado',
    englishName: 'Spicy Egg',
    nutritionData: {
      calories: 180,
      protein: 13,
      carbs: 6,
      fat: 12,
      sugar: 3,
      sodium: 450,
    },
    servingSize: '2 butir (100g)',
    healthGrade: 'B',
    notes: 'Protein tinggi dengan sambal',
  },
  'telur_dadar': {
    indonesianName: 'Telur Dadar',
    englishName: 'Omelette',
    nutritionData: {
      calories: 150,
      protein: 10,
      carbs: 2,
      fat: 12,
      sugar: 0,
      sodium: 250,
    },
    servingSize: '1 porsi (70g)',
    healthGrade: 'B',
    notes: 'Protein baik untuk sarapan',
  },
  'ikan_goreng': {
    indonesianName: 'Ikan Goreng',
    englishName: 'Fried Fish',
    nutritionData: {
      calories: 200,
      protein: 22,
      carbs: 5,
      fat: 10,
      sugar: 0,
      sodium: 400,
    },
    servingSize: '1 potong (80g)',
    healthGrade: 'B',
    notes: 'Protein tinggi, omega-3',
  },
  'ikan_bakar': {
    indonesianName: 'Ikan Bakar',
    englishName: 'Grilled Fish',
    nutritionData: {
      calories: 150,
      protein: 25,
      carbs: 2,
      fat: 5,
      sugar: 1,
      sodium: 350,
    },
    servingSize: '1 potong (80g)',
    healthGrade: 'A',
    notes: 'Sangat sehat, rendah lemak',
  },
  'tempe_goreng': {
    indonesianName: 'Tempe Goreng',
    englishName: 'Fried Tempeh',
    nutritionData: {
      calories: 160,
      protein: 12,
      carbs: 10,
      fat: 9,
      sugar: 0,
      sodium: 150,
    },
    servingSize: '2 potong (60g)',
    healthGrade: 'A',
    notes: 'Protein nabati terbaik',
  },
  'tahu_goreng': {
    indonesianName: 'Tahu Goreng',
    englishName: 'Fried Tofu',
    nutritionData: {
      calories: 120,
      protein: 8,
      carbs: 5,
      fat: 8,
      sugar: 0,
      sodium: 120,
    },
    servingSize: '2 potong (60g)',
    healthGrade: 'A',
    notes: 'Protein nabati rendah kalori',
  },
  'sate_ayam': {
    indonesianName: 'Sate Ayam',
    englishName: 'Chicken Satay',
    nutritionData: {
      calories: 280,
      protein: 22,
      carbs: 15,
      fat: 15,
      sugar: 8,
      sodium: 550,
    },
    servingSize: '5 tusuk (100g)',
    healthGrade: 'B',
    notes: 'Protein tinggi, hati-hati bumbu kacang',
  },

  // =========================================================================
  // INDONESIAN VEGETABLES (Sayuran)
  // =========================================================================
  'sayur_asem': {
    indonesianName: 'Sayur Asem',
    englishName: 'Sour Vegetable Soup',
    nutritionData: {
      calories: 60,
      protein: 2,
      carbs: 12,
      fat: 1,
      sugar: 5,
      sodium: 400,
    },
    servingSize: '1 mangkuk (150g)',
    healthGrade: 'A',
    notes: 'Sayur segar, vitamin tinggi',
  },
  'sayur_lodeh': {
    indonesianName: 'Sayur Lodeh',
    englishName: 'Vegetable in Coconut Milk',
    nutritionData: {
      calories: 120,
      protein: 3,
      carbs: 10,
      fat: 8,
      sugar: 4,
      sodium: 450,
    },
    servingSize: '1 mangkuk (150g)',
    healthGrade: 'B',
    notes: 'Sayur dengan santan',
  },
  'tumis_kangkung': {
    indonesianName: 'Tumis Kangkung',
    englishName: 'Stir-fried Water Spinach',
    nutritionData: {
      calories: 70,
      protein: 3,
      carbs: 5,
      fat: 5,
      sugar: 2,
      sodium: 350,
    },
    servingSize: '1 porsi (100g)',
    healthGrade: 'A',
    notes: 'Sayur hijau, zat besi tinggi',
  },
  'cap_cay': {
    indonesianName: 'Cap Cay',
    englishName: 'Mixed Vegetables',
    nutritionData: {
      calories: 100,
      protein: 5,
      carbs: 12,
      fat: 4,
      sugar: 4,
      sodium: 500,
    },
    servingSize: '1 porsi (150g)',
    healthGrade: 'A',
    notes: 'Sayur campur kaya vitamin',
  },
  'gado_gado': {
    indonesianName: 'Gado-Gado',
    englishName: 'Indonesian Salad',
    nutritionData: {
      calories: 320,
      protein: 12,
      carbs: 25,
      fat: 20,
      sugar: 8,
      sodium: 600,
    },
    servingSize: '1 porsi (200g)',
    healthGrade: 'B',
    notes: 'Sayur dengan bumbu kacang',
  },
  'pecel': {
    indonesianName: 'Pecel',
    englishName: 'Vegetables with Peanut Sauce',
    nutritionData: {
      calories: 280,
      protein: 10,
      carbs: 22,
      fat: 18,
      sugar: 6,
      sodium: 550,
    },
    servingSize: '1 porsi (180g)',
    healthGrade: 'B',
    notes: 'Mirip gado-gado, bumbu berbeda',
  },
  'lalapan': {
    indonesianName: 'Lalapan',
    englishName: 'Fresh Vegetables',
    nutritionData: {
      calories: 30,
      protein: 2,
      carbs: 6,
      fat: 0,
      sugar: 3,
      sodium: 20,
    },
    servingSize: '1 porsi (80g)',
    healthGrade: 'A',
    notes: 'Sayur mentah sangat sehat',
  },

  // =========================================================================
  // INDONESIAN SOUPS (Sup & Soto)
  // =========================================================================
  'soto_ayam': {
    indonesianName: 'Soto Ayam',
    englishName: 'Chicken Soto',
    nutritionData: {
      calories: 250,
      protein: 18,
      carbs: 20,
      fat: 12,
      sugar: 2,
      sodium: 800,
    },
    servingSize: '1 mangkuk (300g)',
    healthGrade: 'B',
    notes: 'Sup tradisional bergizi',
  },
  'sop_buntut': {
    indonesianName: 'Sop Buntut',
    englishName: 'Oxtail Soup',
    nutritionData: {
      calories: 350,
      protein: 25,
      carbs: 15,
      fat: 22,
      sugar: 3,
      sodium: 700,
    },
    servingSize: '1 mangkuk (350g)',
    healthGrade: 'B',
    notes: 'Protein tinggi, kolagen',
  },
  'bakso': {
    indonesianName: 'Bakso',
    englishName: 'Meatball Soup',
    nutritionData: {
      calories: 280,
      protein: 15,
      carbs: 30,
      fat: 12,
      sugar: 2,
      sodium: 900,
    },
    servingSize: '1 mangkuk (350g)',
    healthGrade: 'C',
    notes: 'Enak tapi tinggi sodium',
  },
  'rawon': {
    indonesianName: 'Rawon',
    englishName: 'Black Beef Soup',
    nutritionData: {
      calories: 300,
      protein: 22,
      carbs: 15,
      fat: 18,
      sugar: 2,
      sodium: 650,
    },
    servingSize: '1 mangkuk (350g)',
    healthGrade: 'B',
    notes: 'Khas Jawa Timur, protein tinggi',
  },

  // =========================================================================
  // GORENGAN & SNACKS (Cemilan)
  // =========================================================================
  'gorengan': {
    indonesianName: 'Gorengan',
    englishName: 'Fried Snacks',
    nutritionData: {
      calories: 180,
      protein: 3,
      carbs: 20,
      fat: 10,
      sugar: 2,
      sodium: 250,
    },
    servingSize: '2 potong (50g)',
    healthGrade: 'D',
    notes: 'Tinggi lemak jenuh',
  },
  'kerupuk': {
    indonesianName: 'Kerupuk',
    englishName: 'Crackers',
    nutritionData: {
      calories: 50,
      protein: 1,
      carbs: 7,
      fat: 2,
      sugar: 0,
      sodium: 200,
    },
    servingSize: '5 keping (10g)',
    healthGrade: 'C',
    notes: 'Pendamping makan',
  },
  'martabak_manis': {
    indonesianName: 'Martabak Manis',
    englishName: 'Sweet Pancake',
    nutritionData: {
      calories: 450,
      protein: 8,
      carbs: 55,
      fat: 22,
      sugar: 30,
      sodium: 350,
    },
    servingSize: '1 potong (100g)',
    healthGrade: 'D',
    notes: 'Tinggi gula dan lemak',
  },
  'pisang_goreng': {
    indonesianName: 'Pisang Goreng',
    englishName: 'Fried Banana',
    nutritionData: {
      calories: 150,
      protein: 2,
      carbs: 25,
      fat: 6,
      sugar: 15,
      sodium: 80,
    },
    servingSize: '1 buah (60g)',
    healthGrade: 'C',
    notes: 'Cemilan populer, gula alami',
  },

  // =========================================================================
  // BEVERAGES (Minuman)
  // =========================================================================
  'es_teh_manis': {
    indonesianName: 'Es Teh Manis',
    englishName: 'Sweet Iced Tea',
    nutritionData: {
      calories: 90,
      protein: 0,
      carbs: 23,
      fat: 0,
      sugar: 22,
      sodium: 10,
    },
    servingSize: '1 gelas (250ml)',
    healthGrade: 'D',
    notes: 'Gula tinggi, minta kurang manis',
  },
  'kopi_susu': {
    indonesianName: 'Kopi Susu',
    englishName: 'Milk Coffee',
    nutritionData: {
      calories: 120,
      protein: 3,
      carbs: 18,
      fat: 4,
      sugar: 15,
      sodium: 50,
    },
    servingSize: '1 gelas (200ml)',
    healthGrade: 'C',
    notes: 'Gula dari susu kental manis',
  },
  'es_jeruk': {
    indonesianName: 'Es Jeruk',
    englishName: 'Orange Juice',
    nutritionData: {
      calories: 110,
      protein: 1,
      carbs: 27,
      fat: 0,
      sugar: 24,
      sodium: 5,
    },
    servingSize: '1 gelas (250ml)',
    healthGrade: 'C',
    notes: 'Vitamin C tapi gula tinggi',
  },
  'jus_alpukat': {
    indonesianName: 'Jus Alpukat',
    englishName: 'Avocado Smoothie',
    nutritionData: {
      calories: 280,
      protein: 4,
      carbs: 30,
      fat: 16,
      sugar: 20,
      sodium: 40,
    },
    servingSize: '1 gelas (300ml)',
    healthGrade: 'C',
    notes: 'Lemak sehat tapi kalori tinggi',
  },
  'air_putih': {
    indonesianName: 'Air Putih',
    englishName: 'Water',
    nutritionData: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
    },
    servingSize: '1 gelas (250ml)',
    healthGrade: 'A',
    notes: 'Pilihan terbaik!',
  },

  // =========================================================================
  // ORIGINAL COCO-SSD MAPPINGS (for backward compatibility)
  // =========================================================================
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
