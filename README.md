# 🍽️ NutriSphere

<div align="center">
  <img src="public/icons/icon-192x192.png" alt="NutriSphere Logo" width="120" />
  
  **Democratizing Nutrition for Every Indonesian Student's Wallet**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?logo=supabase)](https://supabase.com/)
  [![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google)](https://ai.google.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://typescriptlang.org/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
</div>

---

## 🎯 The Problem We Solve

### 🏠 The "No-Fridge" Crisis
Many Indonesian students live in *kos-kosan* without refrigerators, leading them to avoid fresh ingredients that spoil quickly. Result? **Reliance on instant noodles**.

### 💸 Financial Blindspot
Students think "healthy eating = expensive." In reality, cooking yourself is cheaper, but they don't know how to buy ingredients in **small portions (eceran)**.

### 📱 Data Input Fatigue
Traditional nutrition apps require tedious manual entry, causing users to **abandon them within days**.

---

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 14 (App Router) | PWA with SSR/SSG capabilities |
| **Language** | TypeScript 5.3+ (Strict) | Type-safe development |
| **Styling** | Tailwind CSS 3.4 | Mobile-first responsive design |
| **Animation** | Framer Motion 12 | Smooth, premium UI animations |
| **Database** | Supabase (PostgreSQL) | Real-time user data + Row Level Security |
| **Auth** | Supabase Auth | Email/Password + OAuth providers |
| **State** | TanStack Query v5 | Server state caching & mutations |
| **Vision AI** | Google Gemini 2.5 Flash | Food detection & nutritional analysis |
| **Text AI** | Groq API (Llama 3) | Ultra-fast recipe generation |
| **Edge AI** | TensorFlow.js COCO-SSD | Client-side object detection |
| **Charts** | Recharts | Nutrition trend visualization |
| **PWA** | next-pwa + Workbox | Offline-first capabilities |

---

## ✨ Core Features

### 1. 👁️ **Hyper-Local Vision Lens**
Zero-typing nutrition input using AI-powered camera:

- **Food Scanner**: Point at any food → Gemini 2.5 Flash identifies & estimates nutrition
- **Nutrition Label Reader**: OCR + AI sanitization for packaged food labels
- **Warteg Scanner**: TensorFlow.js detects multiple Indonesian foods on plate
- **Health Grade**: Automatic A/B/C/D grading with layman explanations

### 2. 🍳 **Survival Chef Engine**
Budget-friendly recipe generator with "Single-Use" logic:

```
Input:  Budget Rp 15,000 + Tools (Rice Cooker only)
Output: Complete recipe with:
        ✅ Eceran portions (1 sachet kecap, not 1 bottle)
        ✅ No spoilage (ingredients used completely)
        ✅ Exact wet market shopping list
        ✅ Savings calculation vs buying food
```

### 3. 🎮 **NutriGotchi Economy**
Gamification linking health to wallet:

| Action | Reward |
|--------|--------|
| Scan healthy food (Grade A) | +30 XP, +10 Gold |
| Cook a recipe | +50 XP, +20 Gold |
| Daily streak | +5 Gold per day |
| Level up | Unlock new avatar styles |

**Gold Utility**: Buy skins, hats, and accessories for your NutriGotchi!

### 4. 🛍️ **Shop & Marketplace**
Spend your earned Gold on:
- Avatar accessories (hats, glasses, companions)
- Profile themes
- Special badges

### 5. 📊 **Nutrition History & Analytics**
Track your journey with:
- Calorie trend charts (hourly/daily/weekly)
- Macros distribution pie chart
- Collapsible food log timeline
- Soft-delete (hide) unwanted entries

---

## 🏗️ Project Structure

```
nutrisphere/
├── app/
│   ├── (auth)/              # Login, Register, Forgot/Reset Password
│   ├── (dashboard)/         
│   │   ├── home/            # Main dashboard with NutriGotchi
│   │   ├── scan/            # Camera scanner (Vision + OCR + Warteg)
│   │   ├── recipes/         # Survival Chef recipe generator
│   │   ├── shop/            # NutriGotchi marketplace
│   │   ├── history/         # Nutrition history & analytics
│   │   └── profile/         # User profile & settings
│   └── api/                 # API routes
│       ├── vision-analyze/  # Gemini food detection
│       ├── food-plate-analyze/  # Multi-food plate analysis
│       ├── ocr-sanitize/    # Nutrition label processing
│       ├── recipes/         # Recipe generation & saving
│       └── food-logs/       # Food log CRUD
├── components/
│   ├── ai/                  # Camera, Scanner, Detection views
│   ├── dashboard/           # Dashboard UI components
│   ├── gamification/        # NutriGotchi avatar system
│   ├── layout/              # Navbar, Mobile menu
│   ├── recipes/             # Recipe cards & forms
│   ├── shop/                # Marketplace components
│   └── ui/                  # Reusable UI (Toast, Modals, etc.)
├── lib/
│   ├── supabase/            # Supabase client configuration
│   ├── ai/                  # Gemini client & image utilities
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React context providers
│   └── stores/              # Zustand state management
├── services/                # Business logic services
├── types/                   # TypeScript interfaces
└── supabase/migrations/     # Database schema migrations
```

---

## 🔧 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase project ([supabase.com](https://supabase.com))
- Google AI API key ([ai.google.dev](https://ai.google.dev))
- Groq API key ([console.groq.com](https://console.groq.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/nutrisphere.git
cd nutrisphere

# 2. Install dependencies
npm install

# 3. Set up environment variables
copy .env.local.example .env.local
```

Fill in your `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Groq (for recipes)
GROQ_API_KEY=your_groq_api_key
```

```bash
# 4. Run database migrations
# (Execute SQL files in supabase/migrations/ via Supabase Dashboard)

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

---

## 📱 PWA Installation

NutriSphere works as a **Progressive Web App**:

1. Visit the website on your mobile device
2. Browser prompts "Add to Home Screen"
3. App installs locally with offline capabilities
4. **No App Store required!** 🎉

---

## 🧠 The AI Pipeline

### Vision Analysis Flow
```
📸 Camera Capture
      ↓
🖼️ Image → Base64 encoding
      ↓
🤖 Gemini 2.5 Flash API
      ↓
📊 JSON Response:
   {
     "food_name": "Nasi Goreng",
     "calories": 650,
     "protein": 15,
     "health_grade": "C",
     "confidence": 0.92
   }
```

### 🛡️ 5-Layer AI Reliability Architecture
All AI outputs pass through a comprehensive validation system:

```
Layer 1: Image Quality Check → Brightness, blur, resolution validation
Layer 2: AI Confidence → Per-field confidence scores in prompts
Layer 3: Knowledge Validation → Check against 200+ Indonesian foods database
Layer 4: Human-in-the-Loop → Confidence badges, validation warnings
Layer 5: Fallback Modes → Timeout handling, manual food selection
```

### Hybrid OCR Pipeline (Bandwidth Optimized)
```
📸 Photo nutrition label (2MB image)
      ↓
🔍 Tesseract.js OCR on-device (FREE, PRIVATE)
      ↓
📝 Raw text: "Enerqi: 1O0 kcaI, Lemak: 3q" (noisy)
      ↓
☁️ Send TEXT to Groq API (1KB, not image!)
      ↓
✨ Clean JSON: { calories: 100, fat: 3 }

Result: 99.95% data savings! 📉
```

---

## 🔐 Security & Privacy

- **Edge AI First**: Object detection happens on-device
- **Supabase RLS**: Row Level Security isolates user data
- **JWT Auth**: Secure token-based authentication
- **Environment Variables**: Secrets never committed to repo

---

## 📊 Database Schema

Key tables in Supabase:

| Table | Purpose |
|-------|---------|
| `profiles` | User data, NutriGotchi stats, wallet balance |
| `food_logs` | Scanned food entries with nutrition data |
| `saved_recipes` | User's saved recipes from Survival Chef |
| `accessories` | Shop items (hats, glasses, etc.) |
| `user_accessories` | Owned items per user |

---

## 🚧 Development Roadmap

### ✅ Phase 1: Foundation (Complete)
- [x] Authentication (Login, Register, Forgot Password)
- [x] Dashboard with NutriGotchi
- [x] Gemini-powered food scanner
- [x] OCR nutrition label reader
- [x] Survival Chef recipe generator
- [x] NutriGotchi gamification system

### ✅ Phase 2: Enhancement (Complete)
- [x] Shop & accessories marketplace
- [x] Nutrition history with charts
- [x] Warteg multi-food scanner
- [x] Barcode scanning support
- [x] XP & Gold reward system

### ✅ Phase 3: AI Reliability (Complete)
- [x] 5-layer AI reliability architecture
- [x] Knowledge base (200+ Indonesian foods)
- [x] Validation engine for nutrition & recipes
- [x] Fallback modes for graceful degradation

### 🔜 Phase 4: Scale
- [ ] Community recipe sharing
- [ ] Local market price integration
- [ ] Nutrition streak challenges
- [ ] Partnerships with pasar tradisional

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for powerful vision AI
- **Supabase** for backend infrastructure
- **Groq** for ultra-fast Llama 3 inference
- **TensorFlow.js** for edge AI capabilities
- Indonesian students for inspiring this solution 🇮🇩

---

<div align="center">
  <strong>Built with ❤️ for Indonesian Students</strong>
  <br/>
  <em>Democratizing Nutrition, One Meal at a Time</em>
  <br/><br/>
  
  🍽️ **NutriSphere** - Makan Sehat, Dompet Hemat!
</div>