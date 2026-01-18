# Indonesian Market Prices Reference (2024)

Reference data for validating AI-generated recipe ingredient prices.
Based on pasar tradisional (wet markets), warung, and minimarket prices.

## Price Ranges by Category

### PROTEINS

| Item | Unit | Min (IDR) | Max (IDR) | Market Type |
|------|------|-----------|-----------|-------------|
| Telur Ayam | 1 butir | 2000 | 3000 | retail |
| Telur Ayam | 1 kg | 25000 | 35000 | wet_market |
| Daging Ayam | 100g | 7000 | 12000 | wet_market |
| Daging Sapi | 100g | 13000 | 18000 | wet_market |
| Ikan Laut (umum) | 100g | 5000 | 12000 | wet_market |
| Ikan Teri | 50g | 5000 | 10000 | wet_market |
| Udang | 100g | 15000 | 30000 | wet_market |
| Tempe | 100g | 2500 | 5000 | wet_market |
| Tahu | 100g | 2000 | 4000 | wet_market |
| Bakso (isi ulang) | 5 butir | 5000 | 10000 | retail |

### CARBOHYDRATES

| Item | Unit | Min (IDR) | Max (IDR) | Market Type |
|------|------|-----------|-----------|-------------|
| Beras | 1 kg | 12000 | 18000 | retail |
| Beras | 100g | 1500 | 2500 | retail |
| Mie Instan | 1 bungkus | 3000 | 5000 | retail |
| Mie Basah | 200g | 5000 | 8000 | wet_market |
| Roti Tawar | 1 loyang | 12000 | 20000 | retail |
| Roti Tawar | 1 lembar | 1000 | 2000 | retail |
| Kentang | 100g | 2500 | 5000 | wet_market |
| Singkong | 100g | 1500 | 3000 | wet_market |

### VEGETABLES

| Item | Unit | Min (IDR) | Max (IDR) | Market Type |
|------|------|-----------|-----------|-------------|
| Kangkung | 1 ikat | 2000 | 5000 | wet_market |
| Bayam | 1 ikat | 2000 | 5000 | wet_market |
| Wortel | 100g | 2000 | 5000 | wet_market |
| Kubis/Kol | 100g | 1500 | 3000 | wet_market |
| Tomat | 100g | 3000 | 7000 | wet_market |
| Buncis | 100g | 3000 | 6000 | wet_market |
| Tauge | 100g | 2000 | 4000 | wet_market |
| Jagung Manis | 1 buah | 3000 | 6000 | wet_market |
| Terong | 1 buah | 2000 | 4000 | wet_market |
| Cabai Merah | 100g | 15000 | 50000 | wet_market |
| Cabai Rawit | 100g | 20000 | 80000 | wet_market |

### AROMATICS & SPICES

| Item | Unit | Min (IDR) | Max (IDR) | Market Type |
|------|------|-----------|-----------|-------------|
| Bawang Merah | 100g | 8000 | 20000 | wet_market |
| Bawang Putih | 100g | 8000 | 18000 | wet_market |
| Bawang Putih | 3 siung | 1000 | 3000 | retail |
| Jahe | 50g | 2000 | 5000 | wet_market |
| Kunyit | 50g | 2000 | 4000 | wet_market |
| Lengkuas | 50g | 1500 | 4000 | wet_market |
| Serai | 1 batang | 500 | 1500 | wet_market |
| Daun Salam | 5 lembar | 500 | 1500 | wet_market |
| Daun Jeruk | 5 lembar | 500 | 1500 | wet_market |
| Kemiri | 5 butir | 2000 | 4000 | wet_market |
| Ketumbar Bubuk | 1 sachet | 1000 | 2500 | sachet |

### CONDIMENTS (Sachet)

| Item | Unit | Min (IDR) | Max (IDR) | Market Type |
|------|------|-----------|-----------|-------------|
| Kecap Manis | 1 sachet | 500 | 2000 | sachet |
| Kecap Asin | 1 sachet | 500 | 2000 | sachet |
| Saus Sambal | 1 sachet | 500 | 2000 | sachet |
| Saus Tomat | 1 sachet | 500 | 2000 | sachet |
| Mayonaise | 1 sachet | 1000 | 3000 | sachet |
| Santan Instan | 1 sachet | 3000 | 6000 | sachet |
| Kaldu Ayam | 1 sachet | 1000 | 3000 | sachet |
| Bumbu Racik | 1 sachet | 2000 | 5000 | sachet |

### OILS & COOKING ESSENTIALS

| Item | Unit | Min (IDR) | Max (IDR) | Market Type |
|------|------|-----------|-----------|-------------|
| Minyak Goreng | 1 liter | 14000 | 20000 | retail |
| Minyak Goreng | 1 sachet | 1000 | 3000 | sachet |
| Garam | 1 bungkus kecil | 500 | 1500 | sachet |
| Gula Pasir | 100g | 1500 | 3000 | retail |
| Gula Merah | 100g | 3000 | 6000 | wet_market |
| Tepung Terigu | 100g | 1500 | 3000 | retail |
| Tepung Tapioka | 100g | 1500 | 3000 | retail |
| Mentega | 1 sachet | 2000 | 5000 | sachet |

### DAIRY

| Item | Unit | Min (IDR) | Max (IDR) | Market Type |
|------|------|-----------|-----------|-------------|
| Susu UHT | 200ml | 4000 | 8000 | retail |
| Susu Kental Manis | 1 sachet | 2000 | 4000 | sachet |
| Keju | 1 slice | 2000 | 5000 | retail |

---

## Validation Rules for Recipe Prices

### Rule 1: Minimum Viable Meal
A complete meal should cost minimum Rp 5,000 (excluding rice cooker meals).

### Rule 2: Protein Price Floor
Any protein ingredient should be minimum Rp 2,000 per portion.

### Rule 3: Sachet Strategy
For student budgets, always prefer sachet versions:
- Kecap: Rp 500-2,000 (not Rp 15,000 bottle)
- Minyak: Rp 1,000-3,000 (not Rp 18,000 liter)
- Santan: Rp 3,000-6,000 (not Rp 20,000 carton)

### Rule 4: Seasonal Vegetables
Cabai prices fluctuate 3x-5x during shortages.
Flag if AI suggests cabai at bottom-of-range prices during typical high-season months.

### Rule 5: Savings Reality Check
Savings vs restaurant should be 30-60% typically.
If AI claims >80% savings, flag as unrealistic.

### Rule 6: Rice Cooker Constraint
Rice cooker recipes should exclude:
- Frying oils (unless coating nonstick)
- Ingredients requiring sautéing
- Raw meat that needs searing

---

## Common Price Hallucination Patterns

### Pattern 1: Under-pricing Eggs
AI often says "telur 1 butir Rp 1,000" - too low.
Reality: Rp 2,000-3,000 per egg.

### Pattern 2: Bulk Pricing for Single-Use
AI suggests "bawang merah 100g Rp 5,000" - too low for retail.
Reality: Wet market 100g minimum Rp 8,000+.

### Pattern 3: Ignoring Sachet Availability
AI suggests full bottle/liter when sachets available.
Always prefer sachets for budget recipes.

### Pattern 4: Stale Cabai Prices
AI stuck on old prices. Cabai Rawit can hit Rp 80,000/100g.
Use current range, not historical averages.
