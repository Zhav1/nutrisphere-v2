# **PROJECT DOCUMENT: NUTRISPHERE**
### **Tagline:** *Democratizing Nutrition for Every Student's Wallet.*
**(Inovasi Web App Nutrisi Berbasis Multimodal AI dengan Pendekatan Ekonomi Mikro Mahasiswa)**

---

## **1. EXECUTIVE SUMMARY (Ringkasan Eksekutif)**
NutriSphere adalah *Progressive Web Application* (PWA) pertama di Indonesia yang menangani masalah gizi mahasiswa dari akar masalahnya: **Keterbatasan Ekonomi (Budget)** dan **Keterbatasan Fasilitas (Tanpa Kulkas/Alat Masak)**.

Berbeda dengan aplikasi gizi konvensional yang hanya mencatat kalori, NutriSphere bertindak sebagai "Ahli Strategi" yang membantu mahasiswa mengubah uang saku terbatas menjadi makanan bergizi melalui teknologi **Multimodal Vision AI** (Google Gemini 2.5 Flash) dan **Generative AI** yang hemat biaya.

---

## **2. LATAR BELAKANG MASALAH (The Why)**
Kami mengangkat realita "Anak Kos" yang sering diabaikan:
1.  **The "No-Fridge" Crisis:** Banyak mahasiswa tidak memiliki kulkas. Akibatnya, mereka takut membeli sayur/daging mentah karena takut busuk. Solusinya? Mie instan yang awet.
2.  **Financial Blindspot:** Mahasiswa menganggap "makan sehat = mahal". Padahal, masak sendiri jauh lebih murah, tapi mereka tidak tahu cara belanja bahan *eceran*.
3.  **Data Input Fatigue:** Aplikasi pencatat gizi (seperti MyFitnessPal) membosankan karena user harus mengetik manual.

---

## **3. ARSITEKTUR TEKNOLOGI (The Innovation)**
Kami menggunakan pendekatan **"Smart Resource Engineering"** untuk memastikan aplikasi berjalan cepat, gratis, dan hemat kuota.

**Tech Stack:**
* **Frontend:** Next.js (React) + Tailwind CSS (PWA Support).
* **Multimodal Vision AI:** Google Gemini 2.5 Flash (Free Tier) - *Direct image-to-JSON extraction*.
* **Cloud Intelligence (Optional):** Google Gemini 2.5 Flash (for text-only tasks like recipe generation).
* **Database:** Supabase (PostgreSQL with RLS).
* **Authentication:** Supabase Auth (Email/Password, Google OAuth).
* **Storage:** Supabase Storage (Photo receipts, food images).
* **Data Fetching:** TanStack Query (React Query) for caching & synchronization.

**Gemini Flash Vision Pipeline (Inovasi Utama):**

1.  **Capture:** User memfoto label gizi.
2.  **Base64 Encoding:** Konversi gambar ke Base64 string untuk dikirim ke API.
3.  **Gemini Flash Analysis:** Kirim gambar langsung ke Gemini 2.5 Flash dengan multimodal prompt.
    * *Input:* Base64 Image + System Prompt yang meminta ekstraksi data nutrisi.
    * *Kelebihan:* Gemini "melihat" langsung angka-angka di label, bahkan dengan background berwarna/noise.
4.  **JSON Output:** Gemini mengembalikan data terstruktur:
    * *Hasil:* `{ "is_valid_food": true, "calories": 100, "protein": 3, "sugar": 5, "healthGrade": "B", "laymanExplanation": "Lumayan nih, tapi gula agak tinggi ya!" }`.

---

## **4. FITUR UTAMA (The Tri-Core Features)**

### **A. Fitur 1: Hyper-Local Vision Lens (Mata Cerdas)**
Solusi input data tanpa mengetik, menggunakan kamera.
* **Mode 1: Label Decoder (Gemini Flash Vision).**
    * Membaca label gizi makanan kemasan dengan teknologi multimodal.
    * AI memberikan "Health Grade" (A/B/C/D) dan peringatan bahasa manusia (Contoh: "Gula setara 3 sendok makan!").
* **Mode 2: Warteg Scanner (TensorFlow.js - Optional).**
    * User memfoto piring makan siang.
    * AI mendeteksi objek: "Nasi Putih", "Telur Dadar", "Tempe Orek".
    * Estimasi kalori instan tanpa perlu mengetik satu per satu.

### **B. Fitur 2: Survival Chef Engine (Otak Strategis)**
Fitur *killer* untuk mahasiswa tanpa kulkas.
* **Input:** Budget (Rp 12.000) + Alat (Rice Cooker).
* **Logic (Gemini Flash):** Membuat resep *Single-Use* (Sekali Habis).
    * Tidak akan menyuruh beli "1 Botol Kecap" (10rb), tapi "1 Sachet Kecap" (500 perak).
    * Tidak akan menyuruh beli "1 Kg Ayam", tapi "1 Ons Ayam Filet".
* **Output:** Resep langkah demi langkah memasak menggunakan Rice Cooker, lengkap dengan **Checklist Belanja Eceran** di tukang sayur.

### **C. Fitur 3: NutriGotchi Economy (Jiwa Aplikasi)**
Gamifikasi yang menghubungkan Kesehatan dengan Dompet.
* **Avatar:** Kondisi fisik NutriGotchi mencerminkan asupan gizi user 3 hari terakhir.
* **Save-to-Earn:**
    * Harga pasaran nasi goreng: Rp 15.000.
    * Biaya masak user (Survival Chef): Rp 9.000.
    * Hemat: Rp 6.000 $\rightarrow$ Dikonversi menjadi **60 Gold**.
* **Gold Utility:** Membeli *skin* atau aksesoris untuk NutriGotchi. Ini memotivasi user berhemat dengan cara sehat.

---

## 1. TECHNICAL STANDARDS & STACK
**Objective:** Build a resource-constrained PWA using Next.js, Multimodal Vision AI (Gemini 2.5 Flash), and Supabase backend.

### **Core Stack**
* **Framework:** Next.js 14+ (App Router). **Strictly no Page Router.**
* **Language:** TypeScript 5.0+ (Strict Mode enabled).
* **Styling:** Tailwind CSS (Mobile-first approach).
* **Database:** Supabase (PostgreSQL) with Row Level Security (RLS).
* **Authentication:** Supabase Auth (Email/Password, Google OAuth, Magic Links).
* **Storage:** Supabase Storage for images (food photos, receipts, avatars).
* **State Management:** `zustand` (Global Client State) + `@tanstack/react-query` (Server State).
* **AI (Vision & Text):** `@google/generative-ai` (SDK for Gemini 2.5 Flash).
* **AI (Object Detection - Optional):** `@tensorflow/tfjs` + `coco-ssd` (or custom model) for Object Detection.

### **Performance Constraints**
* **Bundle Size:** Lazy load heavy AI libraries (`@tensorflow/tfjs` if used).
* **PWA:** Must include `manifest.json` and Service Workers for offline caching.
* **Database Queries:** Use Supabase's built-in caching and TanStack Query for optimal performance.

---

## 2. DIRECTORY ARCHITECTURE
Maintain this strict structure to separate "Vision Intelligence" from "Cloud Intelligence" and "Database Logic".

```text
/
├── app/
│   ├── (auth)/             # Login/Register routes
│   ├── (dashboard)/        # Protected routes (Home, Scan, Profile)
│   ├── api/                # Next.js API Routes (Gemini Integration)
│   ├── layout.tsx          # Root Layout (PWA Setup)
│   └── page.tsx            # Landing Page
├── components/
│   ├── ai/
│   │   ├── CameraView.tsx  # HTML5 Stream handling
│   │   ├── VisionOverlay.tsx  # Bounding box visualization
│   │   └── Scanner.tsx     # Logic wrapper for Gemini Vision
│   ├── gamification/
│   │   ├── NutriGotchi.tsx # Avatar SVG/Canvas component
│   │   └── StatBar.tsx     # Health/Gold UI
│   └── ui/                 # Shadcn/Tailwind generic components
├── lib/
│   ├── supabase/           # config.ts, client.ts, server.ts
│   ├── ai/
│   │   ├── imageUtils.ts   # Base64 encoding utilities
│   │   └── geminiClient.ts # Server-side Gemini wrapper
│   ├── stores/
│   │   └── useAppStore.ts  # Zustand: Scan pipeline state
│   └── hooks/
│       ├── useProfile.ts   # React Query: User profile
│       ├── useFoodLogs.ts  # React Query: Food history
│       └── useRecipes.ts   # React Query: Recipes
├── public/
│   ├── models/             # TF.js models (if self-hosted)
│   └── icons/              # PWA icons
├── types/                  # Global TypeScript Interfaces
│   └── index.ts
├── services/
│   ├── visionService.ts    # Gemini Vision logic
│   └── recipeService.ts    # Logic for generating 'Survival' recipes
└── supabase/
    ├── migrations/         # SQL migration files
    └── seed.sql            # Sample data
```

---

## 3. DATABASE SCHEMA (POSTGRESQL)

### **A. Authentication (Managed by Supabase Auth)**

Supabase automatically creates the `auth.users` table. We extend it with a public `profiles` table.

### **B. Profiles Table (User + NutriGotchi Data)**

```sql
-- public.profiles
-- Stores user profile and gamification data
-- RLS: Users can only read/update their own profile

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT, -- URL to Supabase Storage
  
  -- Gamification: NutriGotchi
  wallet_balance INTEGER DEFAULT 0, -- Virtual gold
  total_savings_rp INTEGER DEFAULT 0, -- Real money saved
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  max_xp INTEGER DEFAULT 100, -- Formula: level * 100
  health INTEGER DEFAULT 100 CHECK (health >= 0 AND health <= 100),
  mood TEXT DEFAULT 'neutral' CHECK (mood IN ('happy', 'neutral', 'sick')),
  accessories JSONB DEFAULT '[]'::jsonb, -- Array of accessory IDs
  
  -- Stats
  streak_days INTEGER DEFAULT 0,
  recipes_cooked INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### **C. Food Logs Table (Nutrition Tracking)**

```sql
-- public.food_logs
-- Stores user meal/food entries
-- RLS: Users can only access their own logs

CREATE TABLE public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Food details
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein NUMERIC(6,2) DEFAULT 0,
  carbs NUMERIC(6,2) DEFAULT 0,
  fat NUMERIC(6,2) DEFAULT 0,
  sugar NUMERIC(6,2) DEFAULT 0,
  sodium NUMERIC(6,2) DEFAULT 0,
  
  -- Metadata
  health_grade TEXT CHECK (health_grade IN ('A', 'B', 'C', 'D')),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  source TEXT CHECK (source IN ('vision_scan', 'object_detection', 'manual', 'recipe')),
  
  -- Optional: Image evidence
  image_url TEXT, -- Supabase Storage URL
  
  -- Vision AI data (if from scan)
  nutrition_data JSONB, -- Structured nutritional data from Gemini
  
  -- Timestamps
  consumed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_logs_user_id ON public.food_logs(user_id);
CREATE INDEX idx_food_logs_consumed_at ON public.food_logs(consumed_at DESC);

-- RLS Policies
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food logs"
  ON public.food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
  ON public.food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs"
  ON public.food_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
  ON public.food_logs FOR DELETE
  USING (auth.uid() = user_id);
```

### **D. Recipes Table (Generated Recipes)**

```sql
-- public.recipes
-- Stores AI-generated recipes
-- RLS: Users can only access their own recipes

CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Recipe details
  title TEXT NOT NULL,
  total_cost_rp INTEGER NOT NULL,
  savings_vs_buying_rp INTEGER DEFAULT 0,
  calories INTEGER DEFAULT 0,
  protein NUMERIC(6,2) DEFAULT 0,
  
  -- Recipe data (stored as JSONB for flexibility)
  ingredients JSONB NOT NULL, -- Array of {name, qty, marketType, estimatedPriceRp}
  steps JSONB NOT NULL, -- Array of cooking steps
  
  -- Metadata
  is_rice_cooker_only BOOLEAN DEFAULT false,
  tools_required TEXT[], -- e.g., ['Rice Cooker', 'Pan']
  
  -- User engagement
  is_favorite BOOLEAN DEFAULT false,
  times_cooked INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_cooked_at TIMESTAMPTZ
);

CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX idx_recipes_created_at ON public.recipes(created_at DESC);

-- RLS Policies
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);
```

### **E. Crowd Contributions Table (Community Vision Data)**

```sql
-- public.crowd_contributions
-- Stores validated nutrition data from community
-- RLS: Public read, authenticated insert

CREATE TABLE public.crowd_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Product identification
  barcode TEXT, -- If scanned from product
  product_name TEXT NOT NULL,
  brand TEXT,
  
  -- Nutrition data (validated)
  nutrition_data JSONB NOT NULL, -- {calories, protein, sugar, sodium, etc.}
  health_grade TEXT CHECK (health_grade IN ('A', 'B', 'C', 'D')),
  
  -- Evidence
  image_url TEXT, -- Product label photo
  
  -- Community validation
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false, -- Admin verification
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crowd_contributions_barcode ON public.crowd_contributions(barcode);
CREATE INDEX idx_crowd_contributions_verified ON public.crowd_contributions(is_verified);

-- RLS Policies
ALTER TABLE public.crowd_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified contributions"
  ON public.crowd_contributions FOR SELECT
  USING (is_verified = true OR auth.uid() = contributor_id);

CREATE POLICY "Authenticated users can insert contributions"
  ON public.crowd_contributions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Contributors can update own contributions"
  ON public.crowd_contributions FOR UPDATE
  USING (auth.uid() = contributor_id);
```

### **F. Accessories Table (NutriGotchi Shop)**

```sql
-- public.accessories
-- Catalog of purchasable NutriGotchi items
-- RLS: Public read

CREATE TABLE public.accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('hat', 'outfit', 'background', 'pet')),
  price_gold INTEGER NOT NULL, -- Cost in virtual gold
  image_url TEXT, -- Supabase Storage URL
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  required_level INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.accessories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available accessories"
  ON public.accessories FOR SELECT
  USING (is_available = true);
```

---

## 4. DATA SCHEMAS (TYPESCRIPT INTERFACES)

### **A. NutriGotchi & User Economy**

The gamification engine relies on converting "Savings" into "Gold".

```typescript
// types/database.ts (Generated from Supabase)

export type HealthGrade = 'A' | 'B' | 'C' | 'D';
export type Mood = 'happy' | 'neutral' | 'sick';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type FoodSource = 'vision_scan' | 'object_detection' | 'manual' | 'recipe';

export interface Profile {
  id: string; // UUID from auth.users
  display_name: string | null;
  avatar_url: string | null;
  
  // Gamification
  wallet_balance: number;
  total_savings_rp: number;
  level: number;
  current_xp: number;
  max_xp: number;
  health: number;
  mood: Mood;
  accessories: string[]; // Accessory UUIDs
  
  // Stats
  streak_days: number;
  recipes_cooked: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Client-side NutriGotchi state (mapped from Profile)
export interface NutriGotchiState {
  level: number;
  currentXp: number;
  maxXp: number;
  mood: Mood;
  health: number;
  accessories: string[];
}
```

### **B. Survival Chef (Recipe Logic)**

Recipes must enforce the "Single-Use" logic (avoiding bulk purchases).

```typescript
// types/recipe.ts

export interface Ingredient {
  name: string;
  qty: string; // e.g., "2 pcs" or "100g"
  marketType: 'retail' | 'sachet' | 'wet_market';
  estimatedPriceRp: number;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  total_cost_rp: number;
  savings_vs_buying_rp: number;
  calories: number;
  protein: number;
  ingredients: Ingredient[]; // Stored as JSONB in DB
  steps: string[]; // Stored as JSONB in DB
  is_rice_cooker_only: boolean;
  tools_required: string[];
  is_favorite: boolean;
  times_cooked: number;
  created_at: string;
  last_cooked_at: string | null;
}
```

### **C. Vision Scan Result**

The output after the Gemini Flash Vision Pipeline (Direct Image -> Structured JSON).

```typescript
// types/scan.ts

export interface NutritionalInfo {
  calories: number;
  protein: number;
  sugar: number;
  sodium: number;
  carbs?: number;
  fat?: number;
}

export interface VisionScanResult {
  isValidFood: boolean; // Whether the image contains valid food label
  nutritionData: NutritionalInfo; // Extracted from image
  healthGrade: HealthGrade;
  laymanExplanation: string; // e.g., "Gula setara 3 sendok makan!" (In Indonesian)
}

export interface FoodLog {
  id: string;
  user_id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  sodium: number;
  health_grade: HealthGrade | null;
  meal_type: MealType | null;
  source: FoodSource;
  image_url: string | null;
  nutrition_data: NutritionalInfo | null;
  consumed_at: string;
  created_at: string;
}
```

---

## 5. AI SYSTEM PROMPTS (LLM ENGINEERING)

### **A. The Nutrition Vision Analyst (Google Gemini 2.5 Flash)**

*Context:* Gemini 2.5 Flash receives a Base64-encoded image of a nutrition label and must extract numerical data using its multimodal vision capabilities.

**System Prompt:**

```text
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
   - Grade A: Low sugar (<5g per serving), Low sodium (<140mg)
   - Grade B: Moderate sugar (5-10g), Moderate sodium (140-400mg)
   - Grade C: High sugar (10-20g) OR High sodium (400-600mg)
   - Grade D: Very high sugar (>20g) OR Very high sodium (>600mg)

6. GENERATE "layman_explanation" in casual Bahasa Indonesia slang for students:
   - Use relatable comparisons (e.g., "Gula setara 3 sendok makan!")
   - Be encouraging for healthy products ("Mantap! Ini sehat banget!")
   - Be scary/warning for unhealthy products ("Waduh, natrium-nya gila!")

OUTPUT FORMAT (STRICT JSON ONLY, NO MARKDOWN):
{
  "is_valid_food": boolean,
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
- If "is_valid_food" is false, still output the JSON structure with all nutritional values set to 0.
- Always provide a "laymanExplanation" even if the image is invalid (e.g., "Ini bukan makanan bro, foto boneka aja kok discan 😅")
```

### **B. The Survival Chef (Google Gemini 2.5 Flash)**

*Context:* The user provides a budget (e.g., Rp 12.000) and available tools. Gemini must act as a micro-economic strategist.

**System Prompt:**

```text
You are 'Survival Chef', a master of cooking with extreme budget constraints for Indonesian students.
Constraints:
1. User Budget: {{userBudget}} IDR.
2. Tools: {{userTools}} (e.g., Rice Cooker only).
3. Strategy: "Single-Use Economy". NEVER suggest buying bulk ingredients (e.g., do not say 'Buy 1 bottle of soy sauce', say 'Buy 1 sachet of soy sauce').
4. Target: Create a nutritious meal that fits the budget.

Task:
Generate a recipe JSON.
- Ingredients must be purchasable at a 'Warung' or 'Pasar' in small quantities (eceran).
- Estimate the price of the specific amount used.
- Calculate 'savingsVsBuyingRp': Compare your recipe cost vs buying the same dish at a restaurant (standard Indonesian pricing).

Output STRICT JSON matching this schema:
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
}
```

---

## 6. STATE MANAGEMENT & DATA FETCHING

### **A. Client State (Zustand) - UI State Only**

Use Zustand ONLY for ephemeral UI state (e.g., scanning pipeline status).

```typescript
// lib/stores/useAppStore.ts

interface AppState {
  isScanning: boolean;
  scanStage: 'idle' | 'capturing' | 'processing_vision' | 'complete';
  currentScanResult: VisionScanResult | null;
  actions: {
    startScan: () => void;
    processImage: (imageData: string) => Promise<void>;
    reset: () => void;
  }
}
```

### **B. Server State (TanStack Query) - Database Synchronization**

Use TanStack Query for ALL Supabase data fetching. This provides:
- Automatic caching
- Background refetching
- Optimistic updates
- Offline support (via cache)

```typescript
// lib/hooks/useProfile.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', updates.id!)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate profile cache
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
    },
  });
}
```

```typescript
// lib/hooks/useFoodLogs.ts

export function useFoodLogs(userId: string) {
  return useQuery({
    queryKey: ['foodLogs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userId)
        .order('consumed_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });
}

export function useAddFoodLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (log: Omit<FoodLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('food_logs')
        .insert(log)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['foodLogs', data.user_id] });
    },
  });
}
```

### **C. Real-time Subscriptions (Optional)**

For real-time updates (e.g., NutriGotchi health changes):

```typescript
// lib/hooks/useRealtimeProfile.ts

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export function useRealtimeProfile(userId: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          // Update cache with new data
          queryClient.setQueryData(['profile', userId], payload.new);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
```

---

## 7. SUPABASE CONFIGURATION

### **A. Environment Variables**

```bash
# .env.local

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini API (for Vision & Text inference)
GEMINI_API_KEY=your-gemini-api-key-here
```

### **B. Supabase Client Setup**

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

```typescript
// lib/supabase/server.ts (for Server Components/Actions)
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

### **C. Storage Configuration**

```typescript
// lib/supabase/storage.ts

import { supabase } from './client';

export async function uploadFoodImage(
  userId: string,
  file: File
): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('food-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('food-images')
    .getPublicUrl(data.path);
  
  return urlData.publicUrl;
}
```

---

## 8. GEMINI VISION INTEGRATION

### **A. Gemini Client Setup**

```typescript
// lib/ai/geminiClient.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeNutritionLabel(
  base64Image: string
): Promise<VisionScanResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `[Insert System Prompt from Section 5.A here]`;

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

  // Parse JSON response
  const parsedData = JSON.parse(text);
  return parsedData;
}

export async function generateRecipe(
  budget: number,
  tools: string[]
): Promise<Recipe> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `[Insert System Prompt from Section 5.B here, with {{userBudget}} and {{userTools}} replaced]`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Parse JSON response
  const parsedData = JSON.parse(text);
  return parsedData;
}
```

### **B. Vision Service**

```typescript
// services/visionService.ts

import { analyzeNutritionLabel } from '@/lib/ai/geminiClient';
import { VisionScanResult } from '@/types/scan';

export async function processNutritionLabel(
  imageDataUrl: string
): Promise<VisionScanResult> {
  // Extract base64 data from data URL
  const base64Data = imageDataUrl.split(',')[1];

  try {
    const result = await analyzeNutritionLabel(base64Data);
    return result;
  } catch (error) {
    console.error('Vision analysis error:', error);
    throw new Error('Failed to analyze nutrition label');
  }
}
```

### **C. API Route for Vision Analysis**

```typescript
// app/api/vision-analyze/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { processNutritionLabel } from '@/services/visionService';

export async function POST(req: NextRequest) {
  try {
    const { imageData } = await req.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    const result = await processNutritionLabel(imageData);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
```

---

## 9. IMPLEMENTATION PRIORITIES

### **Phase 1: Supabase Setup**
1. Create Supabase project at https://supabase.com
2. Run SQL migrations to create tables (use Supabase SQL Editor or migration files)
3. Set up RLS policies (included in schema above)
4. Configure Storage buckets:
   - `food-images` (public read, authenticated write)
   - `avatars` (public read, authenticated write)

### **Phase 2: Authentication Flow**
1. Implement Supabase Auth in Next.js
2. Create protected route middleware
3. Build login/register pages
4. Implement profile creation trigger (auto-create profile row when user signs up)

### **Phase 3: Data Layer**
1. Set up TanStack Query provider in `app/layout.tsx`
2. Create React Query hooks for:
   - Profile management (`useProfile`, `useUpdateProfile`)
   - Food logs (`useFoodLogs`, `useAddFoodLog`)
   - Recipes (`useRecipes`, `useGenerateRecipe`)
3. Implement optimistic updates for better UX

### **Phase 4: Gemini Vision Pipeline**
1. Set up Google Gemini API key
2. Build `CameraView` component
3. Implement `visionService.ts` for Gemini Vision integration
4. Create API route `/api/vision-analyze`
5. Save scan results to `food_logs` table

### **Phase 5: Recipe Generation**
1. Implement Gemini-powered recipe generation
2. Build recipe UI components
3. Integrate with `recipes` table
4. Add savings calculation logic

### **Phase 6: Gamification**
1. Build NutriGotchi avatar component
2. Implement XP/Gold calculation logic
3. Create accessories shop UI
4. Add real-time profile updates

---

## 10. MIGRATION FROM LEGACY OCR ARCHITECTURE

If migrating from the old Tesseract.js + Groq architecture:

### **Code Changes Required**
1. **Remove Dependencies:**
   - Uninstall `tesseract.js`
   - Uninstall `groq-sdk`
   - Install `@google/generative-ai`

2. **Rename Files:**
   - `services/ocrService.ts` → `services/visionService.ts`

3. **Remove Directories:**
   - Delete `public/workers/` (Tesseract workers no longer needed)

4. **Update Components:**
   - `components/ai/Scanner.tsx`: Replace OCR logic with Gemini Vision API call
   - Remove preprocessing steps (grayscale, contrast adjustment)

5. **Update API Routes:**
   - Delete `/api/ocr-sanitize`
   - Create `/api/vision-analyze`

6. **Database Migration:**
   - Run SQL to remove `ocr_raw_text` column from `food_logs`
   - Rename `ocr_sanitized_data` to `nutrition_data`
   - Update `source` enum to replace `'ocr_scan'` with `'vision_scan'`

```sql
-- Migration script
ALTER TABLE public.food_logs DROP COLUMN ocr_raw_text;
ALTER TABLE public.food_logs RENAME COLUMN ocr_sanitized_data TO nutrition_data;
```

### **Environment Variables Update**
- Remove `GROQ_API_KEY`
- Add `GEMINI_API_KEY`

---

## 11. SECURITY CHECKLIST

- ✅ **Row Level Security (RLS)**: All tables have RLS enabled
- ✅ **Authentication Required**: API routes check `auth.uid()`
- ✅ **Input Validation**: Validate all user inputs before DB insertion
- ✅ **Rate Limiting**: Use Supabase Edge Functions for rate limiting
- ✅ **CORS Configuration**: Set allowed origins in Supabase dashboard
- ✅ **Environment Variables**: Never expose `GEMINI_API_KEY` to client
- ✅ **SQL Injection Prevention**: Use Supabase's parameterized queries
- ✅ **Image Validation**: Validate image size and format before sending to Gemini

---

## 12. PERFORMANCE OPTIMIZATION

### **Database**
- Use indexes on frequently queried columns (`user_id`, `consumed_at`)
- Denormalize data where appropriate (e.g., cache total calories in profile)
- Use JSONB for flexible schema (ingredients, nutrition data)

### **Frontend**
- TanStack Query handles caching automatically
- Lazy load AI libraries if using TensorFlow.js for object detection
- Use Supabase's built-in CDN for images
- Compress images before sending to Gemini (max 4MB recommended)

### **API Optimization**
- Implement request debouncing for vision API calls
- Cache common product scans in `crowd_contributions` table
- Use Gemini's free tier efficiently (15 RPM, 1 million TPM, 1500 RPD)

### **Edge Functions**
- Consider moving Gemini API calls to Supabase Edge Functions for better security
- This prevents exposing API key to client-side code

---

**END OF DOCUMENT**