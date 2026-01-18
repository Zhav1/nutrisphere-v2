# Indonesian Food Nutrition Database (RAG Knowledge Base)

This file contains nutrition reference data for Indonesian foods.
Used by the validation engine to check AI-generated nutrition values against known bounds.

## Format

Each food entry contains:
- **Name**: Indonesian name (primary), English name (secondary)
- **Category**: staple | protein | vegetable | soup | snack | beverage | dessert
- **Standard Portion**: Description with gram weight
- **Nutrition per Portion**: calories, protein, carbs, fat (with min/max bounds)
- **Common Misidentifications**: Foods AI often confuses this with
- **Flags**: Dietary warnings (high_sodium, high_sugar, etc.)

---

## STAPLES (Makanan Pokok)

### Nasi Putih
- **English**: White Rice
- **Category**: staple
- **Portion**: 1 centong (100g)
- **Nutrition**:
  - Calories: 130 (min: 120, max: 145)
  - Protein: 2.7g (min: 2, max: 4)
  - Carbs: 28g (min: 25, max: 32)
  - Fat: 0.3g (min: 0, max: 1)
- **Flags**: high_carb

### Nasi Goreng
- **English**: Fried Rice
- **Category**: staple
- **Portion**: 1 piring (250g)
- **Nutrition**:
  - Calories: 350 (min: 280, max: 450)
  - Protein: 10g (min: 6, max: 15)
  - Carbs: 45g (min: 35, max: 55)
  - Fat: 14g (min: 8, max: 20)
- **Common Misidentifications**: "pilaf", "yellow rice", "biryani"
- **Flags**: high_sodium, high_fat

### Nasi Uduk
- **English**: Coconut Rice
- **Category**: staple
- **Portion**: 1 centong (150g)
- **Nutrition**:
  - Calories: 200 (min: 170, max: 240)
  - Protein: 4g (min: 3, max: 6)
  - Carbs: 35g (min: 28, max: 42)
  - Fat: 5g (min: 3, max: 8)
- **Flags**: moderate_fat

### Mie Goreng
- **English**: Fried Noodles
- **Category**: staple
- **Portion**: 1 piring (220g)
- **Nutrition**:
  - Calories: 400 (min: 320, max: 500)
  - Protein: 12g (min: 8, max: 18)
  - Carbs: 52g (min: 40, max: 65)
  - Fat: 16g (min: 10, max: 25)
- **Common Misidentifications**: "lo mein", "chow mein", "pad thai"
- **Flags**: high_sodium, high_carb

### Mie Ayam
- **English**: Chicken Noodles
- **Category**: staple
- **Portion**: 1 mangkuk (300g)
- **Nutrition**:
  - Calories: 450 (min: 380, max: 550)
  - Protein: 20g (min: 15, max: 28)
  - Carbs: 55g (min: 45, max: 70)
  - Fat: 15g (min: 10, max: 22)
- **Flags**: high_sodium

### Mie Instan
- **English**: Instant Noodles
- **Category**: staple
- **Portion**: 1 bungkus (85g dry)
- **Nutrition**:
  - Calories: 380 (min: 350, max: 420)
  - Protein: 8g (min: 6, max: 10)
  - Carbs: 52g (min: 48, max: 58)
  - Fat: 14g (min: 12, max: 18)
- **Flags**: very_high_sodium, processed

### Bubur Ayam
- **English**: Chicken Porridge
- **Category**: staple
- **Portion**: 1 mangkuk (350g)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 350)
  - Protein: 15g (min: 10, max: 20)
  - Carbs: 35g (min: 28, max: 45)
  - Fat: 9g (min: 5, max: 14)
- **Common Misidentifications**: "congee", "rice porridge"

### Lontong
- **English**: Rice Cake
- **Category**: staple
- **Portion**: 1 potong (100g)
- **Nutrition**:
  - Calories: 150 (min: 130, max: 180)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 33g (min: 28, max: 40)
  - Fat: 0.5g (min: 0, max: 2)

### Ketupat
- **English**: Woven Rice Cake
- **Category**: staple
- **Portion**: 1 buah (100g)
- **Nutrition**:
  - Calories: 145 (min: 125, max: 170)
  - Protein: 3g (min: 2, max: 4)
  - Carbs: 32g (min: 27, max: 38)
  - Fat: 0.3g (min: 0, max: 1)

---

## PROTEINS (Lauk Pauk)

### Ayam Goreng
- **English**: Fried Chicken
- **Category**: protein
- **Portion**: 1 potong paha (100g)
- **Nutrition**:
  - Calories: 250 (min: 200, max: 320)
  - Protein: 25g (min: 20, max: 32)
  - Carbs: 5g (min: 0, max: 12)
  - Fat: 15g (min: 10, max: 22)
- **Common Misidentifications**: "fried chicken wings", "KFC"

### Ayam Bakar
- **English**: Grilled Chicken
- **Category**: protein
- **Portion**: 1 potong paha (100g)
- **Nutrition**:
  - Calories: 200 (min: 160, max: 250)
  - Protein: 28g (min: 22, max: 35)
  - Carbs: 3g (min: 0, max: 8)
  - Fat: 9g (min: 5, max: 14)

### Ayam Geprek
- **English**: Smashed Fried Chicken
- **Category**: protein
- **Portion**: 1 porsi (150g with sambal)
- **Nutrition**:
  - Calories: 350 (min: 280, max: 450)
  - Protein: 28g (min: 22, max: 35)
  - Carbs: 15g (min: 8, max: 22)
  - Fat: 20g (min: 14, max: 28)
- **Flags**: high_sodium, spicy

### Rendang
- **English**: Beef Rendang
- **Category**: protein
- **Portion**: 1 porsi (80g)
- **Nutrition**:
  - Calories: 300 (min: 240, max: 380)
  - Protein: 20g (min: 15, max: 28)
  - Carbs: 10g (min: 5, max: 15)
  - Fat: 20g (min: 14, max: 28)
- **Common Misidentifications**: "beef stew", "curry beef", "steak"
- **Flags**: high_fat

### Dendeng
- **English**: Dried Meat
- **Category**: protein
- **Portion**: 1 porsi (50g)
- **Nutrition**:
  - Calories: 220 (min: 180, max: 280)
  - Protein: 25g (min: 20, max: 32)
  - Carbs: 12g (min: 8, max: 18)
  - Fat: 8g (min: 5, max: 14)
- **Flags**: high_sodium

### Gulai Daging
- **English**: Beef Curry
- **Category**: protein
- **Portion**: 1 porsi (100g)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 18g (min: 14, max: 25)
  - Carbs: 8g (min: 4, max: 14)
  - Fat: 20g (min: 14, max: 28)
- **Common Misidentifications**: "curry", "korma"

### Ikan Goreng
- **English**: Fried Fish
- **Category**: protein
- **Portion**: 1 potong (80g)
- **Nutrition**:
  - Calories: 200 (min: 150, max: 260)
  - Protein: 22g (min: 18, max: 30)
  - Carbs: 5g (min: 0, max: 10)
  - Fat: 10g (min: 6, max: 16)

### Ikan Bakar
- **English**: Grilled Fish
- **Category**: protein
- **Portion**: 1 potong (80g)
- **Nutrition**:
  - Calories: 150 (min: 110, max: 200)
  - Protein: 25g (min: 20, max: 32)
  - Carbs: 2g (min: 0, max: 6)
  - Fat: 5g (min: 2, max: 10)
- **Flags**: omega3

### Ikan Pepes
- **English**: Steamed Fish in Banana Leaf
- **Category**: protein
- **Portion**: 1 bungkus (100g)
- **Nutrition**:
  - Calories: 180 (min: 140, max: 230)
  - Protein: 24g (min: 18, max: 32)
  - Carbs: 4g (min: 0, max: 8)
  - Fat: 8g (min: 4, max: 14)

### Telur Ceplok
- **English**: Fried Egg
- **Category**: protein
- **Portion**: 1 butir (50g)
- **Nutrition**:
  - Calories: 120 (min: 90, max: 150)
  - Protein: 7g (min: 5, max: 9)
  - Carbs: 1g (min: 0, max: 2)
  - Fat: 10g (min: 7, max: 14)

### Telur Dadar
- **English**: Omelette
- **Category**: protein
- **Portion**: 1 porsi (70g)
- **Nutrition**:
  - Calories: 150 (min: 110, max: 200)
  - Protein: 10g (min: 8, max: 14)
  - Carbs: 2g (min: 0, max: 5)
  - Fat: 12g (min: 8, max: 16)

### Telur Balado
- **English**: Egg in Chili Sauce
- **Category**: protein
- **Portion**: 2 butir (120g)
- **Nutrition**:
  - Calories: 220 (min: 180, max: 280)
  - Protein: 13g (min: 10, max: 18)
  - Carbs: 8g (min: 4, max: 14)
  - Fat: 15g (min: 10, max: 22)
- **Common Misidentifications**: "pizza" (red sauce confusion)
- **Flags**: spicy

### Tempe Goreng
- **English**: Fried Tempeh
- **Category**: protein
- **Portion**: 2 potong (60g)
- **Nutrition**:
  - Calories: 160 (min: 120, max: 200)
  - Protein: 12g (min: 8, max: 16)
  - Carbs: 10g (min: 6, max: 15)
  - Fat: 9g (min: 5, max: 14)
- **Flags**: plant_protein, fermented

### Tempe Bacem
- **English**: Sweet Braised Tempeh
- **Category**: protein
- **Portion**: 2 potong (60g)
- **Nutrition**:
  - Calories: 180 (min: 140, max: 230)
  - Protein: 10g (min: 7, max: 14)
  - Carbs: 18g (min: 12, max: 25)
  - Fat: 8g (min: 5, max: 12)
- **Flags**: plant_protein, high_sugar

### Tahu Goreng
- **English**: Fried Tofu
- **Category**: protein
- **Portion**: 2 potong (60g)
- **Nutrition**:
  - Calories: 120 (min: 90, max: 160)
  - Protein: 8g (min: 6, max: 12)
  - Carbs: 5g (min: 2, max: 10)
  - Fat: 8g (min: 5, max: 12)
- **Flags**: plant_protein

### Tahu Isi
- **English**: Stuffed Tofu
- **Category**: protein
- **Portion**: 2 buah (80g)
- **Nutrition**:
  - Calories: 200 (min: 150, max: 260)
  - Protein: 10g (min: 7, max: 14)
  - Carbs: 18g (min: 12, max: 25)
  - Fat: 10g (min: 6, max: 16)

### Sate Ayam
- **English**: Chicken Satay
- **Category**: protein
- **Portion**: 5 tusuk (100g without sauce)
- **Nutrition**:
  - Calories: 200 (min: 150, max: 260)
  - Protein: 22g (min: 18, max: 30)
  - Carbs: 5g (min: 2, max: 10)
  - Fat: 10g (min: 6, max: 16)
- **Note**: Add 80 kcal for peanut sauce

### Sate Kambing
- **English**: Lamb Satay
- **Category**: protein
- **Portion**: 5 tusuk (100g)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 20g (min: 15, max: 28)
  - Carbs: 3g (min: 0, max: 8)
  - Fat: 22g (min: 16, max: 30)
- **Flags**: high_fat

---

## VEGETABLES (Sayuran)

### Sayur Asem
- **English**: Sour Vegetable Soup
- **Category**: vegetable
- **Portion**: 1 mangkuk (150g)
- **Nutrition**:
  - Calories: 60 (min: 40, max: 90)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 12g (min: 8, max: 18)
  - Fat: 1g (min: 0, max: 3)
- **Flags**: low_calorie, vitamin_rich

### Sayur Lodeh
- **English**: Vegetables in Coconut Milk
- **Category**: vegetable
- **Portion**: 1 mangkuk (150g)
- **Nutrition**:
  - Calories: 120 (min: 80, max: 170)
  - Protein: 3g (min: 2, max: 6)
  - Carbs: 10g (min: 6, max: 16)
  - Fat: 8g (min: 4, max: 14)

### Sayur Bayam
- **English**: Spinach Soup
- **Category**: vegetable
- **Portion**: 1 mangkuk (150g)
- **Nutrition**:
  - Calories: 50 (min: 30, max: 80)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 6g (min: 3, max: 10)
  - Fat: 2g (min: 0, max: 4)
- **Flags**: iron_rich, low_calorie

### Tumis Kangkung
- **English**: Stir-fried Water Spinach
- **Category**: vegetable
- **Portion**: 1 porsi (100g)
- **Nutrition**:
  - Calories: 70 (min: 50, max: 100)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 5g (min: 3, max: 10)
  - Fat: 5g (min: 2, max: 8)
- **Flags**: iron_rich

### Cap Cay
- **English**: Mixed Stir-fried Vegetables
- **Category**: vegetable
- **Portion**: 1 porsi (150g)
- **Nutrition**:
  - Calories: 100 (min: 70, max: 150)
  - Protein: 5g (min: 3, max: 8)
  - Carbs: 12g (min: 8, max: 18)
  - Fat: 4g (min: 2, max: 8)

### Gado-Gado
- **English**: Indonesian Salad with Peanut Sauce
- **Category**: vegetable
- **Portion**: 1 porsi (200g)
- **Nutrition**:
  - Calories: 320 (min: 250, max: 420)
  - Protein: 12g (min: 8, max: 18)
  - Carbs: 25g (min: 18, max: 35)
  - Fat: 20g (min: 14, max: 28)
- **Common Misidentifications**: "salad", "vegetable platter"

### Pecel
- **English**: Vegetables with Spicy Peanut Sauce
- **Category**: vegetable
- **Portion**: 1 porsi (180g)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 10g (min: 7, max: 15)
  - Carbs: 22g (min: 15, max: 32)
  - Fat: 18g (min: 12, max: 26)

### Lalapan
- **English**: Fresh Raw Vegetables
- **Category**: vegetable
- **Portion**: 1 porsi (80g)
- **Nutrition**:
  - Calories: 30 (min: 15, max: 50)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 6g (min: 3, max: 10)
  - Fat: 0g (min: 0, max: 1)
- **Flags**: raw, low_calorie

### Urap
- **English**: Vegetables with Coconut Dressing
- **Category**: vegetable
- **Portion**: 1 porsi (100g)
- **Nutrition**:
  - Calories: 150 (min: 110, max: 200)
  - Protein: 4g (min: 2, max: 7)
  - Carbs: 12g (min: 8, max: 18)
  - Fat: 10g (min: 6, max: 16)

### Capcay Goreng
- **English**: Stir-fried Mixed Vegetables (dry)
- **Category**: vegetable
- **Portion**: 1 porsi (150g)
- **Nutrition**:
  - Calories: 120 (min: 80, max: 170)
  - Protein: 6g (min: 4, max: 10)
  - Carbs: 10g (min: 6, max: 16)
  - Fat: 7g (min: 4, max: 12)

---

## SOUPS (Sup & Soto)

### Soto Ayam
- **English**: Chicken Soto
- **Category**: soup
- **Portion**: 1 mangkuk (300g)
- **Nutrition**:
  - Calories: 250 (min: 180, max: 340)
  - Protein: 18g (min: 12, max: 26)
  - Carbs: 20g (min: 12, max: 30)
  - Fat: 12g (min: 7, max: 20)
- **Common Misidentifications**: "chicken soup", "noodle soup"

### Soto Betawi
- **English**: Jakarta-style Beef Soto
- **Category**: soup
- **Portion**: 1 mangkuk (350g)
- **Nutrition**:
  - Calories: 400 (min: 320, max: 500)
  - Protein: 22g (min: 16, max: 30)
  - Carbs: 18g (min: 10, max: 28)
  - Fat: 28g (min: 20, max: 38)
- **Flags**: high_fat (coconut milk)

### Sop Buntut
- **English**: Oxtail Soup
- **Category**: soup
- **Portion**: 1 mangkuk (350g)
- **Nutrition**:
  - Calories: 350 (min: 280, max: 450)
  - Protein: 25g (min: 18, max: 35)
  - Carbs: 15g (min: 8, max: 25)
  - Fat: 22g (min: 15, max: 32)
- **Flags**: collagen_rich

### Bakso
- **English**: Meatball Soup
- **Category**: soup
- **Portion**: 1 mangkuk (350g)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 380)
  - Protein: 15g (min: 10, max: 22)
  - Carbs: 30g (min: 22, max: 42)
  - Fat: 12g (min: 7, max: 18)
- **Common Misidentifications**: "noodle soup", "pho"
- **Flags**: high_sodium

### Mie Bakso
- **English**: Noodle with Meatballs
- **Category**: soup
- **Portion**: 1 mangkuk (400g)
- **Nutrition**:
  - Calories: 380 (min: 300, max: 480)
  - Protein: 18g (min: 12, max: 25)
  - Carbs: 48g (min: 38, max: 60)
  - Fat: 14g (min: 8, max: 22)

### Rawon
- **English**: Black Beef Soup
- **Category**: soup
- **Portion**: 1 mangkuk (350g)
- **Nutrition**:
  - Calories: 300 (min: 240, max: 400)
  - Protein: 22g (min: 16, max: 30)
  - Carbs: 15g (min: 8, max: 25)
  - Fat: 18g (min: 12, max: 28)
- **Note**: Uses kluwek (black nut)

### Sop Kambing
- **English**: Lamb Soup
- **Category**: soup
- **Portion**: 1 mangkuk (350g)
- **Nutrition**:
  - Calories: 380 (min: 300, max: 480)
  - Protein: 24g (min: 18, max: 32)
  - Carbs: 12g (min: 6, max: 20)
  - Fat: 26g (min: 18, max: 35)
- **Flags**: high_fat

### Tekwan
- **English**: Fish Ball Soup
- **Category**: soup
- **Portion**: 1 mangkuk (300g)
- **Nutrition**:
  - Calories: 220 (min: 160, max: 300)
  - Protein: 16g (min: 10, max: 24)
  - Carbs: 25g (min: 18, max: 35)
  - Fat: 7g (min: 3, max: 12)

---

## SNACKS & FRIED FOODS (Gorengan & Cemilan)

### Gorengan Campur
- **English**: Mixed Fried Snacks
- **Category**: snack
- **Portion**: 3 potong (75g)
- **Nutrition**:
  - Calories: 270 (min: 200, max: 360)
  - Protein: 5g (min: 2, max: 8)
  - Carbs: 30g (min: 22, max: 40)
  - Fat: 15g (min: 10, max: 22)
- **Flags**: deep_fried, high_fat

### Bakwan
- **English**: Vegetable Fritter
- **Category**: snack
- **Portion**: 2 buah (60g)
- **Nutrition**:
  - Calories: 150 (min: 110, max: 200)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 18g (min: 12, max: 25)
  - Fat: 8g (min: 5, max: 12)

### Tempe Mendoan
- **English**: Thin Fried Tempeh
- **Category**: snack
- **Portion**: 2 potong (50g)
- **Nutrition**:
  - Calories: 130 (min: 100, max: 180)
  - Protein: 8g (min: 5, max: 12)
  - Carbs: 10g (min: 6, max: 16)
  - Fat: 7g (min: 4, max: 12)

### Pisang Goreng
- **English**: Fried Banana
- **Category**: snack
- **Portion**: 1 buah (60g)
- **Nutrition**:
  - Calories: 150 (min: 110, max: 200)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 25g (min: 18, max: 35)
  - Fat: 6g (min: 3, max: 10)

### Kerupuk
- **English**: Crackers
- **Category**: snack
- **Portion**: 5 keping (10g)
- **Nutrition**:
  - Calories: 50 (min: 35, max: 70)
  - Protein: 1g (min: 0, max: 2)
  - Carbs: 7g (min: 5, max: 10)
  - Fat: 2g (min: 1, max: 4)

### Emping
- **English**: Melinjo Crackers
- **Category**: snack
- **Portion**: 5 keping (15g)
- **Nutrition**:
  - Calories: 75 (min: 55, max: 100)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 10g (min: 7, max: 14)
  - Fat: 3g (min: 1, max: 6)
- **Flags**: may_trigger_gout

### Risoles
- **English**: Indonesian Croquette
- **Category**: snack
- **Portion**: 2 buah (80g)
- **Nutrition**:
  - Calories: 240 (min: 180, max: 320)
  - Protein: 8g (min: 5, max: 12)
  - Carbs: 25g (min: 18, max: 35)
  - Fat: 12g (min: 8, max: 18)

### Martabak Manis
- **English**: Sweet Thick Pancake
- **Category**: dessert
- **Portion**: 1 potong (100g)
- **Nutrition**:
  - Calories: 450 (min: 350, max: 580)
  - Protein: 8g (min: 5, max: 12)
  - Carbs: 55g (min: 42, max: 70)
  - Fat: 22g (min: 15, max: 32)
- **Flags**: very_high_sugar, high_fat

### Martabak Telur
- **English**: Savory Stuffed Pancake
- **Category**: snack
- **Portion**: 1 potong (120g)
- **Nutrition**:
  - Calories: 320 (min: 250, max: 420)
  - Protein: 15g (min: 10, max: 22)
  - Carbs: 28g (min: 20, max: 38)
  - Fat: 18g (min: 12, max: 26)

---

## BEVERAGES (Minuman)

### Es Teh Manis
- **English**: Sweet Iced Tea
- **Category**: beverage
- **Portion**: 1 gelas (250ml)
- **Nutrition**:
  - Calories: 90 (min: 60, max: 140)
  - Protein: 0g (min: 0, max: 1)
  - Carbs: 23g (min: 15, max: 35)
  - Fat: 0g (min: 0, max: 0)
  - Sugar: 22g (min: 14, max: 34)
- **Flags**: very_high_sugar

### Es Teh Tawar
- **English**: Unsweetened Iced Tea
- **Category**: beverage
- **Portion**: 1 gelas (250ml)
- **Nutrition**:
  - Calories: 2 (min: 0, max: 5)
  - Protein: 0g (min: 0, max: 0)
  - Carbs: 0g (min: 0, max: 1)
  - Fat: 0g (min: 0, max: 0)
- **Flags**: zero_calorie

### Kopi Tubruk
- **English**: Indonesian Black Coffee
- **Category**: beverage
- **Portion**: 1 gelas (150ml)
- **Nutrition**:
  - Calories: 5 (min: 0, max: 15)
  - Protein: 0g (min: 0, max: 1)
  - Carbs: 1g (min: 0, max: 3)
  - Fat: 0g (min: 0, max: 0)
- **Note**: Add 40 kcal per tsp sugar

### Kopi Susu
- **English**: Coffee with Condensed Milk
- **Category**: beverage
- **Portion**: 1 gelas (200ml)
- **Nutrition**:
  - Calories: 120 (min: 80, max: 180)
  - Protein: 3g (min: 2, max: 6)
  - Carbs: 18g (min: 12, max: 28)
  - Fat: 4g (min: 2, max: 8)
- **Flags**: high_sugar

### Es Jeruk
- **English**: Orange Juice
- **Category**: beverage
- **Portion**: 1 gelas (250ml)
- **Nutrition**:
  - Calories: 110 (min: 70, max: 160)
  - Protein: 1g (min: 0, max: 2)
  - Carbs: 27g (min: 18, max: 40)
  - Fat: 0g (min: 0, max: 1)
- **Flags**: vitamin_c, high_sugar

### Jus Alpukat
- **English**: Avocado Smoothie
- **Category**: beverage
- **Portion**: 1 gelas (300ml)
- **Nutrition**:
  - Calories: 280 (min: 200, max: 400)
  - Protein: 4g (min: 2, max: 8)
  - Carbs: 30g (min: 20, max: 45)
  - Fat: 16g (min: 10, max: 25)
- **Flags**: healthy_fat, high_calorie

### Es Campur
- **English**: Mixed Ice Dessert
- **Category**: beverage
- **Portion**: 1 mangkuk (250ml)
- **Nutrition**:
  - Calories: 200 (min: 140, max: 300)
  - Protein: 3g (min: 1, max: 6)
  - Carbs: 45g (min: 32, max: 60)
  - Fat: 3g (min: 1, max: 6)
- **Flags**: high_sugar

### Es Cendol
- **English**: Cendol Iced Dessert
- **Category**: beverage
- **Portion**: 1 gelas (300ml)
- **Nutrition**:
  - Calories: 280 (min: 200, max: 380)
  - Protein: 2g (min: 1, max: 5)
  - Carbs: 55g (min: 40, max: 75)
  - Fat: 8g (min: 4, max: 14)
- **Flags**: high_sugar (palm sugar)

### Air Putih
- **English**: Plain Water
- **Category**: beverage
- **Portion**: 1 gelas (250ml)
- **Nutrition**:
  - Calories: 0 (min: 0, max: 0)
  - Protein: 0g (min: 0, max: 0)
  - Carbs: 0g (min: 0, max: 0)
  - Fat: 0g (min: 0, max: 0)
- **Flags**: best_choice

---

## COMMON AI MISIDENTIFICATIONS

This section lists foods that AI models frequently confuse.

### Rendang → Steak
AI sometimes identifies rendang as "steak" due to similar color/texture.
**Correction**: Rendang has higher fat (coconut), lower protein per weight.

### Telur Balado → Pizza
Red sambal on eggs confuses AI into thinking it's tomato sauce on pizza.
**Correction**: Much lower carbs, higher protein.

### Nasi Goreng → Biryani/Pilaf
Similar appearance but different nutrition profile.
**Correction**: Indonesian nasi goreng typically has more oil.

### Gado-Gado → Garden Salad
Peanut sauce makes gado-gado much higher in calories than typical salads.
**Correction**: 3-4x more calories than plain vegetable salad.

### Bakso → Pho
Both are noodle soups but bakso has meatballs, different nutrition.
**Correction**: Similar calorie range but different protein composition.

### Soto → Curry Soup
Clear broth vs. creamy curry has different fat content.
**Correction**: Soto generally lower in fat unless coconut-based.

---

## PORTION SIZE STANDARDS

Reference for Indonesian typical portions:

| Unit | Weight | Notes |
|------|--------|-------|
| 1 centong nasi | 100g | Standard rice serving |
| 1 piring | 200-300g | Full plate |
| 1 mangkuk | 150-350g | Depends on soup/salad |
| 1 potong ayam | 80-120g | Thigh or breast |
| 1 tusuk sate | 20-30g | Without sauce |
| 1 butir telur | 50g | Medium egg |
| 1 potong tempe | 30g | Standard slice |
| 1 gelas | 200-300ml | Standard glass |

---

## VALIDATION RULES

Use these rules to check AI-generated nutrition:

1. **Macro-Calorie Consistency**: `calories ≈ protein×4 + carbs×4 + fat×9` (±15% tolerance)
2. **Protein Reality Check**: Rice dishes rarely exceed 5g protein without explicit lauk
3. **Fat Reality Check**: Fried foods minimum 5g fat, grilled/steamed lower
4. **Sodium Estimates**: Indonesian food typically 400-1000mg per serving (MSG, kecap)
5. **Sugar in Beverages**: Assume 20-30g sugar in sweetened drinks unless specified "tawar"

---

## ADDITIONAL REGIONAL DISHES

### Gudeg
- **English**: Sweet Jackfruit Stew (Yogyakarta)
- **Category**: staple
- **Portion**: 1 porsi (150g)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 8g (min: 5, max: 12)
  - Carbs: 45g (min: 35, max: 58)
  - Fat: 8g (min: 5, max: 14)
- **Flags**: high_sugar (palm sugar)

### Pempek
- **English**: Fish Cake (Palembang)
- **Category**: snack
- **Portion**: 3 buah (120g)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 18g (min: 14, max: 25)
  - Carbs: 35g (min: 28, max: 45)
  - Fat: 8g (min: 5, max: 14)
- **Note**: Cuko sauce adds 50 kcal

### Siomay Bandung
- **English**: Steamed Fish Dumpling
- **Category**: snack
- **Portion**: 5 buah (150g)
- **Nutrition**:
  - Calories: 300 (min: 240, max: 380)
  - Protein: 20g (min: 15, max: 28)
  - Carbs: 30g (min: 22, max: 40)
  - Fat: 12g (min: 8, max: 18)

### Batagor
- **English**: Fried Fish Dumpling
- **Category**: snack
- **Portion**: 5 buah (150g)
- **Nutrition**:
  - Calories: 380 (min: 300, max: 480)
  - Protein: 18g (min: 14, max: 25)
  - Carbs: 35g (min: 28, max: 45)
  - Fat: 18g (min: 12, max: 26)

### Nasi Padang
- **English**: Padang Rice Set
- **Category**: staple
- **Portion**: 1 set (400g)
- **Nutrition**:
  - Calories: 850 (min: 700, max: 1100)
  - Protein: 35g (min: 28, max: 48)
  - Carbs: 80g (min: 65, max: 100)
  - Fat: 40g (min: 30, max: 55)
- **Flags**: high_calorie, high_fat

### Sate Padang
- **English**: Padang-style Satay
- **Category**: protein
- **Portion**: 8 tusuk (160g with sauce)
- **Nutrition**:
  - Calories: 380 (min: 300, max: 480)
  - Protein: 28g (min: 22, max: 38)
  - Carbs: 15g (min: 10, max: 22)
  - Fat: 24g (min: 18, max: 32)
- **Flags**: high_fat, spicy

### Ayam Pop
- **English**: Padang Steamed Chicken
- **Category**: protein
- **Portion**: 1 potong (100g)
- **Nutrition**:
  - Calories: 180 (min: 140, max: 230)
  - Protein: 26g (min: 20, max: 34)
  - Carbs: 2g (min: 0, max: 5)
  - Fat: 8g (min: 5, max: 12)

### Gulai Ayam
- **English**: Chicken Curry
- **Category**: protein
- **Portion**: 1 porsi (120g)
- **Nutrition**:
  - Calories: 320 (min: 260, max: 400)
  - Protein: 24g (min: 18, max: 32)
  - Carbs: 10g (min: 5, max: 16)
  - Fat: 22g (min: 16, max: 30)

### Gulai Tunjang
- **English**: Padang Tendon Curry
- **Category**: protein
- **Portion**: 1 porsi (100g)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 22g (min: 16, max: 30)
  - Carbs: 8g (min: 4, max: 14)
  - Fat: 18g (min: 12, max: 26)
- **Flags**: collagen_rich

### Bebek Goreng
- **English**: Fried Duck
- **Category**: protein
- **Portion**: 1 potong (120g)
- **Nutrition**:
  - Calories: 350 (min: 280, max: 440)
  - Protein: 28g (min: 22, max: 36)
  - Carbs: 5g (min: 0, max: 12)
  - Fat: 25g (min: 18, max: 34)
- **Flags**: high_fat

### Bebek Bakar
- **English**: Grilled Duck
- **Category**: protein
- **Portion**: 1 potong (120g)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 30g (min: 24, max: 38)
  - Carbs: 4g (min: 0, max: 10)
  - Fat: 16g (min: 10, max: 24)

### Iga Bakar
- **English**: Grilled Ribs
- **Category**: protein
- **Portion**: 2 potong (150g)
- **Nutrition**:
  - Calories: 400 (min: 320, max: 500)
  - Protein: 28g (min: 22, max: 38)
  - Carbs: 12g (min: 6, max: 20)
  - Fat: 28g (min: 20, max: 38)
- **Flags**: high_fat

### Tongseng
- **English**: Spicy Lamb Stew
- **Category**: soup
- **Portion**: 1 mangkuk (250g)
- **Nutrition**:
  - Calories: 350 (min: 280, max: 440)
  - Protein: 24g (min: 18, max: 32)
  - Carbs: 18g (min: 12, max: 28)
  - Fat: 22g (min: 15, max: 30)
- **Flags**: spicy

### Tengkleng
- **English**: Lamb Bone Soup
- **Category**: soup
- **Portion**: 1 mangkuk (280g)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 20g (min: 15, max: 28)
  - Carbs: 15g (min: 8, max: 24)
  - Fat: 16g (min: 10, max: 24)
- **Flags**: collagen_rich

### Konro
- **English**: Rib Soup (Makassar)
- **Category**: soup
- **Portion**: 1 mangkuk (300g)
- **Nutrition**:
  - Calories: 380 (min: 300, max: 480)
  - Protein: 28g (min: 22, max: 38)
  - Carbs: 12g (min: 6, max: 20)
  - Fat: 26g (min: 18, max: 36)

### Coto Makassar
- **English**: Makassar Beef Soup
- **Category**: soup
- **Portion**: 1 mangkuk (300g)
- **Nutrition**:
  - Calories: 350 (min: 280, max: 440)
  - Protein: 26g (min: 20, max: 35)
  - Carbs: 18g (min: 10, max: 28)
  - Fat: 20g (min: 14, max: 28)

### Pallubasa
- **English**: Makassar Offal Soup
- **Category**: soup
- **Portion**: 1 mangkuk (300g)
- **Nutrition**:
  - Calories: 320 (min: 260, max: 400)
  - Protein: 24g (min: 18, max: 32)
  - Carbs: 15g (min: 8, max: 24)
  - Fat: 18g (min: 12, max: 26)

### Sop Saudara
- **English**: Saudara Soup (Makassar)
- **Category**: soup
- **Portion**: 1 mangkuk (300g)
- **Nutrition**:
  - Calories: 340 (min: 270, max: 420)
  - Protein: 25g (min: 19, max: 33)
  - Carbs: 20g (min: 12, max: 30)
  - Fat: 18g (min: 12, max: 26)

### Soto Lamongan
- **English**: Lamongan Chicken Soto
- **Category**: soup
- **Portion**: 1 mangkuk (300g)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 20g (min: 15, max: 28)
  - Carbs: 22g (min: 15, max: 32)
  - Fat: 14g (min: 8, max: 22)

### Soto Kudus
- **English**: Kudus Buffalo Soto
- **Category**: soup
- **Portion**: 1 mangkuk (300g)
- **Nutrition**:
  - Calories: 260 (min: 200, max: 340)
  - Protein: 22g (min: 16, max: 30)
  - Carbs: 18g (min: 10, max: 28)
  - Fat: 12g (min: 7, max: 18)

### Soto Madura
- **English**: Madura-style Soto
- **Category**: soup
- **Portion**: 1 mangkuk (300g)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 20g (min: 15, max: 28)
  - Carbs: 24g (min: 16, max: 34)
  - Fat: 12g (min: 7, max: 18)

### Soto Banjar
- **English**: Banjar Chicken Soto
- **Category**: soup
- **Portion**: 1 mangkuk (300g)
- **Nutrition**:
  - Calories: 300 (min: 240, max: 380)
  - Protein: 22g (min: 16, max: 30)
  - Carbs: 25g (min: 18, max: 35)
  - Fat: 14g (min: 8, max: 22)

---

## MORE PROTEINS

### Ayam Penyet
- **English**: Smashed Fried Chicken
- **Category**: protein
- **Portion**: 1 porsi (150g with sambal)
- **Nutrition**:
  - Calories: 380 (min: 300, max: 480)
  - Protein: 30g (min: 24, max: 40)
  - Carbs: 12g (min: 6, max: 20)
  - Fat: 24g (min: 16, max: 34)
- **Flags**: spicy

### Lele Goreng
- **English**: Fried Catfish
- **Category**: protein
- **Portion**: 1 ekor (80g)
- **Nutrition**:
  - Calories: 220 (min: 170, max: 280)
  - Protein: 22g (min: 17, max: 30)
  - Carbs: 8g (min: 3, max: 14)
  - Fat: 12g (min: 8, max: 18)

### Lele Bakar
- **English**: Grilled Catfish
- **Category**: protein
- **Portion**: 1 ekor (80g)
- **Nutrition**:
  - Calories: 160 (min: 120, max: 210)
  - Protein: 24g (min: 18, max: 32)
  - Carbs: 3g (min: 0, max: 8)
  - Fat: 6g (min: 3, max: 10)

### Bandeng Presto
- **English**: Pressure-cooked Milkfish
- **Category**: protein
- **Portion**: 1 ekor (100g)
- **Nutrition**:
  - Calories: 200 (min: 160, max: 260)
  - Protein: 26g (min: 20, max: 34)
  - Carbs: 2g (min: 0, max: 5)
  - Fat: 10g (min: 6, max: 16)
- **Flags**: omega3

### Udang Goreng Tepung
- **English**: Fried Breaded Shrimp
- **Category**: protein
- **Portion**: 5 ekor (80g)
- **Nutrition**:
  - Calories: 220 (min: 170, max: 280)
  - Protein: 16g (min: 12, max: 22)
  - Carbs: 18g (min: 12, max: 26)
  - Fat: 10g (min: 6, max: 16)

### Udang Bakar
- **English**: Grilled Shrimp
- **Category**: protein
- **Portion**: 5 ekor (80g)
- **Nutrition**:
  - Calories: 120 (min: 90, max: 160)
  - Protein: 22g (min: 17, max: 30)
  - Carbs: 2g (min: 0, max: 5)
  - Fat: 3g (min: 1, max: 6)
- **Flags**: low_fat, high_protein

### Cumi Goreng Tepung
- **English**: Fried Calamari
- **Category**: protein
- **Portion**: 1 porsi (80g)
- **Nutrition**:
  - Calories: 200 (min: 160, max: 260)
  - Protein: 14g (min: 10, max: 20)
  - Carbs: 18g (min: 12, max: 25)
  - Fat: 8g (min: 5, max: 14)

### Cumi Bakar
- **English**: Grilled Squid
- **Category**: protein
- **Portion**: 1 ekor (80g)
- **Nutrition**:
  - Calories: 100 (min: 70, max: 140)
  - Protein: 18g (min: 14, max: 24)
  - Carbs: 2g (min: 0, max: 5)
  - Fat: 2g (min: 1, max: 5)
- **Flags**: low_calorie

### Kepiting Saus Padang
- **English**: Crab in Padang Sauce
- **Category**: protein
- **Portion**: 1 ekor (200g with shell)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 20g (min: 15, max: 28)
  - Carbs: 15g (min: 8, max: 24)
  - Fat: 16g (min: 10, max: 24)
- **Flags**: spicy

### Kerang Saus Tiram
- **English**: Clams in Oyster Sauce
- **Category**: protein
- **Portion**: 1 porsi (100g meat)
- **Nutrition**:
  - Calories: 150 (min: 110, max: 200)
  - Protein: 18g (min: 14, max: 24)
  - Carbs: 10g (min: 6, max: 16)
  - Fat: 4g (min: 2, max: 8)

### Sate Lilit
- **English**: Balinese Minced Satay
- **Category**: protein
- **Portion**: 5 tusuk (100g)
- **Nutrition**:
  - Calories: 240 (min: 190, max: 310)
  - Protein: 18g (min: 14, max: 25)
  - Carbs: 12g (min: 6, max: 20)
  - Fat: 14g (min: 9, max: 20)

### Sate Maranggi
- **English**: Marinated Beef Satay
- **Category**: protein
- **Portion**: 8 tusuk (120g)
- **Nutrition**:
  - Calories: 300 (min: 240, max: 380)
  - Protein: 28g (min: 22, max: 36)
  - Carbs: 8g (min: 3, max: 15)
  - Fat: 18g (min: 12, max: 26)

### Sop Iga
- **English**: Rib Soup
- **Category**: soup
- **Portion**: 1 mangkuk (300g)
- **Nutrition**:
  - Calories: 320 (min: 260, max: 400)
  - Protein: 24g (min: 18, max: 32)
  - Carbs: 15g (min: 8, max: 24)
  - Fat: 20g (min: 14, max: 28)

### Semur Daging
- **English**: Beef in Sweet Soy
- **Category**: protein
- **Portion**: 1 porsi (100g)
- **Nutrition**:
  - Calories: 250 (min: 200, max: 320)
  - Protein: 22g (min: 17, max: 30)
  - Carbs: 12g (min: 7, max: 20)
  - Fat: 14g (min: 9, max: 20)

### Semur Ayam
- **English**: Chicken in Sweet Soy
- **Category**: protein
- **Portion**: 1 potong (100g)
- **Nutrition**:
  - Calories: 200 (min: 160, max: 260)
  - Protein: 24g (min: 18, max: 32)
  - Carbs: 10g (min: 5, max: 16)
  - Fat: 8g (min: 5, max: 14)

### Opor Ayam
- **English**: White Chicken Curry
- **Category**: protein
- **Portion**: 1 potong (120g with sauce)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 24g (min: 18, max: 32)
  - Carbs: 8g (min: 4, max: 14)
  - Fat: 18g (min: 12, max: 26)

### Empal
- **English**: Sweet Fried Beef
- **Category**: protein
- **Portion**: 2 potong (60g)
- **Nutrition**:
  - Calories: 200 (min: 160, max: 260)
  - Protein: 18g (min: 14, max: 25)
  - Carbs: 12g (min: 7, max: 18)
  - Fat: 10g (min: 6, max: 16)

### Gepuk
- **English**: Smashed Sweet Beef
- **Category**: protein
- **Portion**: 2 potong (60g)
- **Nutrition**:
  - Calories: 220 (min: 170, max: 280)
  - Protein: 20g (min: 15, max: 28)
  - Carbs: 14g (min: 8, max: 22)
  - Fat: 10g (min: 6, max: 16)

### Perkedel
- **English**: Potato Fritter
- **Category**: snack
- **Portion**: 2 buah (60g)
- **Nutrition**:
  - Calories: 180 (min: 140, max: 230)
  - Protein: 5g (min: 3, max: 8)
  - Carbs: 22g (min: 16, max: 30)
  - Fat: 9g (min: 5, max: 14)

### Perkedel Jagung
- **English**: Corn Fritter
- **Category**: snack
- **Portion**: 2 buah (50g)
- **Nutrition**:
  - Calories: 150 (min: 110, max: 200)
  - Protein: 4g (min: 2, max: 7)
  - Carbs: 20g (min: 14, max: 28)
  - Fat: 7g (min: 4, max: 12)

---

## MORE VEGETABLES

### Tumis Tauge
- **English**: Stir-fried Bean Sprouts
- **Category**: vegetable
- **Portion**: 1 porsi (100g)
- **Nutrition**:
  - Calories: 60 (min: 40, max: 90)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 6g (min: 3, max: 10)
  - Fat: 3g (min: 1, max: 6)
- **Flags**: low_calorie

### Tumis Buncis
- **English**: Stir-fried Green Beans
- **Category**: vegetable
- **Portion**: 1 porsi (100g)
- **Nutrition**:
  - Calories: 70 (min: 50, max: 100)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 8g (min: 5, max: 12)
  - Fat: 4g (min: 2, max: 7)

### Tumis Terong
- **English**: Stir-fried Eggplant
- **Category**: vegetable
- **Portion**: 1 porsi (100g)
- **Nutrition**:
  - Calories: 80 (min: 55, max: 110)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 8g (min: 5, max: 14)
  - Fat: 5g (min: 3, max: 9)

### Sayur Nangka
- **English**: Jackfruit Curry
- **Category**: vegetable
- **Portion**: 1 mangkuk (150g)
- **Nutrition**:
  - Calories: 140 (min: 100, max: 190)
  - Protein: 3g (min: 2, max: 6)
  - Carbs: 20g (min: 14, max: 28)
  - Fat: 6g (min: 3, max: 10)

### Sayur Labu Siam
- **English**: Chayote Soup
- **Category**: vegetable
- **Portion**: 1 mangkuk (150g)
- **Nutrition**:
  - Calories: 45 (min: 30, max: 70)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 8g (min: 5, max: 12)
  - Fat: 1g (min: 0, max: 3)
- **Flags**: low_calorie

### Plecing Kangkung
- **English**: Spicy Water Spinach (Lombok)
- **Category**: vegetable
- **Portion**: 1 porsi (100g)
- **Nutrition**:
  - Calories: 80 (min: 55, max: 110)
  - Protein: 4g (min: 2, max: 6)
  - Carbs: 6g (min: 3, max: 10)
  - Fat: 5g (min: 3, max: 9)
- **Flags**: spicy

### Sayur Bening
- **English**: Clear Vegetable Soup
- **Category**: vegetable
- **Portion**: 1 mangkuk (150g)
- **Nutrition**:
  - Calories: 40 (min: 25, max: 60)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 7g (min: 4, max: 12)
  - Fat: 1g (min: 0, max: 3)
- **Flags**: low_calorie

### Karedok
- **English**: Sundanese Raw Vegetable Salad
- **Category**: vegetable
- **Portion**: 1 porsi (180g)
- **Nutrition**:
  - Calories: 250 (min: 200, max: 320)
  - Protein: 8g (min: 5, max: 12)
  - Carbs: 20g (min: 14, max: 28)
  - Fat: 16g (min: 10, max: 24)

### Lotek
- **English**: West Java Vegetable Salad
- **Category**: vegetable
- **Portion**: 1 porsi (180g)
- **Nutrition**:
  - Calories: 260 (min: 200, max: 340)
  - Protein: 9g (min: 6, max: 14)
  - Carbs: 22g (min: 15, max: 32)
  - Fat: 16g (min: 10, max: 24)

### Asinan Sayur
- **English**: Pickled Vegetables
- **Category**: vegetable
- **Portion**: 1 porsi (120g)
- **Nutrition**:
  - Calories: 100 (min: 70, max: 140)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 18g (min: 12, max: 26)
  - Fat: 3g (min: 1, max: 6)
- **Flags**: high_sodium

---

## COMPLETE MEALS

### Nasi Campur
- **English**: Mixed Rice
- **Category**: staple
- **Portion**: 1 piring (350g)
- **Nutrition**:
  - Calories: 550 (min: 450, max: 700)
  - Protein: 22g (min: 16, max: 30)
  - Carbs: 65g (min: 52, max: 82)
  - Fat: 22g (min: 15, max: 32)

### Nasi Kuning
- **English**: Yellow Rice
- **Category**: staple
- **Portion**: 1 cone (150g)
- **Nutrition**:
  - Calories: 250 (min: 200, max: 320)
  - Protein: 5g (min: 3, max: 8)
  - Carbs: 45g (min: 35, max: 58)
  - Fat: 6g (min: 3, max: 10)

### Nasi Rames
- **English**: Mixed Side Dishes Rice
- **Category**: staple
- **Portion**: 1 piring (400g)
- **Nutrition**:
  - Calories: 650 (min: 520, max: 820)
  - Protein: 28g (min: 20, max: 38)
  - Carbs: 70g (min: 55, max: 90)
  - Fat: 28g (min: 20, max: 40)

### Nasi Liwet
- **English**: Steamed Coconut Rice
- **Category**: staple
- **Portion**: 1 piring dengan lauk (400g)
- **Nutrition**:
  - Calories: 580 (min: 460, max: 740)
  - Protein: 20g (min: 14, max: 28)
  - Carbs: 65g (min: 52, max: 82)
  - Fat: 26g (min: 18, max: 36)

### Nasi Bakar
- **English**: Grilled Rice in Banana Leaf
- **Category**: staple
- **Portion**: 1 bungkus (200g)
- **Nutrition**:
  - Calories: 380 (min: 300, max: 480)
  - Protein: 14g (min: 10, max: 20)
  - Carbs: 50g (min: 40, max: 65)
  - Fat: 14g (min: 9, max: 20)

### Nasi Pecel
- **English**: Rice with Peanut Sauce Vegetables
- **Category**: staple
- **Portion**: 1 piring (350g)
- **Nutrition**:
  - Calories: 480 (min: 380, max: 600)
  - Protein: 15g (min: 10, max: 22)
  - Carbs: 58g (min: 45, max: 75)
  - Fat: 22g (min: 15, max: 32)

### Ketoprak
- **English**: Tofu Rice Cake with Peanut Sauce
- **Category**: staple
- **Portion**: 1 porsi (250g)
- **Nutrition**:
  - Calories: 380 (min: 300, max: 480)
  - Protein: 14g (min: 10, max: 20)
  - Carbs: 45g (min: 35, max: 58)
  - Fat: 18g (min: 12, max: 26)

### Kupat Tahu
- **English**: Rice Cake with Tofu and Peanut Sauce
- **Category**: staple
- **Portion**: 1 porsi (200g)
- **Nutrition**:
  - Calories: 350 (min: 280, max: 440)
  - Protein: 12g (min: 8, max: 18)
  - Carbs: 42g (min: 32, max: 54)
  - Fat: 16g (min: 10, max: 24)

### Lontong Sayur
- **English**: Rice Cake with Vegetable Soup
- **Category**: staple
- **Portion**: 1 porsi (300g)
- **Nutrition**:
  - Calories: 360 (min: 280, max: 460)
  - Protein: 10g (min: 6, max: 15)
  - Carbs: 50g (min: 40, max: 65)
  - Fat: 14g (min: 9, max: 22)

### Lontong Cap Go Meh
- **English**: Cap Go Meh Rice Cake
- **Category**: staple
- **Portion**: 1 porsi (350g)
- **Nutrition**:
  - Calories: 450 (min: 360, max: 560)
  - Protein: 18g (min: 12, max: 26)
  - Carbs: 55g (min: 42, max: 72)
  - Fat: 18g (min: 12, max: 26)

---

## DESSERTS & SWEETS (Kue & Jajanan)

### Klepon
- **English**: Green Rice Balls with Palm Sugar
- **Category**: dessert
- **Portion**: 3 buah (60g)
- **Nutrition**:
  - Calories: 180 (min: 140, max: 230)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 38g (min: 30, max: 48)
  - Fat: 3g (min: 1, max: 6)
- **Flags**: high_sugar

### Onde-Onde
- **English**: Sesame Balls
- **Category**: dessert
- **Portion**: 2 buah (50g)
- **Nutrition**:
  - Calories: 200 (min: 160, max: 260)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 32g (min: 25, max: 42)
  - Fat: 8g (min: 5, max: 12)
- **Flags**: high_sugar

### Kue Lapis
- **English**: Layer Cake
- **Category**: dessert
- **Portion**: 1 potong (50g)
- **Nutrition**:
  - Calories: 160 (min: 120, max: 210)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 25g (min: 18, max: 34)
  - Fat: 6g (min: 3, max: 10)

### Kue Lumpur
- **English**: Mud Cake
- **Category**: dessert
- **Portion**: 2 buah (60g)
- **Nutrition**:
  - Calories: 180 (min: 140, max: 230)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 28g (min: 22, max: 38)
  - Fat: 7g (min: 4, max: 12)

### Kue Cubit
- **English**: Pinch Cake
- **Category**: dessert
- **Portion**: 4 buah (40g)
- **Nutrition**:
  - Calories: 150 (min: 110, max: 200)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 24g (min: 18, max: 32)
  - Fat: 5g (min: 3, max: 9)

### Serabi
- **English**: Indonesian Pancake
- **Category**: dessert
- **Portion**: 2 buah (60g)
- **Nutrition**:
  - Calories: 200 (min: 160, max: 260)
  - Protein: 3g (min: 2, max: 6)
  - Carbs: 30g (min: 22, max: 40)
  - Fat: 8g (min: 5, max: 14)

### Dadar Gulung
- **English**: Rolled Coconut Crepe
- **Category**: dessert
- **Portion**: 2 buah (80g)
- **Nutrition**:
  - Calories: 240 (min: 190, max: 310)
  - Protein: 4g (min: 2, max: 7)
  - Carbs: 35g (min: 28, max: 46)
  - Fat: 10g (min: 6, max: 16)
- **Flags**: high_sugar

### Nagasari
- **English**: Banana Wrapped in Flour
- **Category**: dessert
- **Portion**: 2 buah (80g)
- **Nutrition**:
  - Calories: 200 (min: 160, max: 260)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 38g (min: 30, max: 50)
  - Fat: 5g (min: 3, max: 9)

### Getuk
- **English**: Mashed Cassava Cake
- **Category**: dessert
- **Portion**: 1 porsi (50g)
- **Nutrition**:
  - Calories: 130 (min: 100, max: 170)
  - Protein: 1g (min: 0, max: 3)
  - Carbs: 30g (min: 24, max: 40)
  - Fat: 1g (min: 0, max: 3)
- **Flags**: high_carb

### Putu
- **English**: Steamed Rice Flour Cake
- **Category**: dessert
- **Portion**: 3 buah (60g)
- **Nutrition**:
  - Calories: 180 (min: 140, max: 230)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 38g (min: 30, max: 50)
  - Fat: 3g (min: 1, max: 6)
- **Flags**: high_sugar

### Lupis
- **English**: Glutinous Rice with Palm Sugar
- **Category**: dessert
- **Portion**: 2 buah (80g)
- **Nutrition**:
  - Calories: 220 (min: 170, max: 280)
  - Protein: 3g (min: 1, max: 5)
  - Carbs: 45g (min: 35, max: 58)
  - Fat: 4g (min: 2, max: 8)
- **Flags**: high_sugar

### Wingko Babat
- **English**: Coconut Cake
- **Category**: dessert
- **Portion**: 1 buah (40g)
- **Nutrition**:
  - Calories: 160 (min: 120, max: 210)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 22g (min: 16, max: 30)
  - Fat: 8g (min: 5, max: 12)

### Bubur Kacang Hijau
- **English**: Mung Bean Porridge
- **Category**: dessert
- **Portion**: 1 mangkuk (250ml)
- **Nutrition**:
  - Calories: 180 (min: 140, max: 240)
  - Protein: 8g (min: 5, max: 12)
  - Carbs: 32g (min: 24, max: 42)
  - Fat: 2g (min: 1, max: 5)

### Bubur Candil
- **English**: Sweet Potato Balls in Coconut
- **Category**: dessert
- **Portion**: 1 mangkuk (200ml)
- **Nutrition**:
  - Calories: 200 (min: 160, max: 260)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 40g (min: 32, max: 52)
  - Fat: 5g (min: 3, max: 9)
- **Flags**: high_sugar

### Bubur Sumsum
- **English**: Rice Flour Porridge
- **Category**: dessert
- **Portion**: 1 mangkuk (200ml)
- **Nutrition**:
  - Calories: 220 (min: 170, max: 280)
  - Protein: 3g (min: 2, max: 6)
  - Carbs: 42g (min: 32, max: 55)
  - Fat: 6g (min: 3, max: 10)
- **Flags**: high_sugar

### Kolak
- **English**: Sweet Coconut Soup with Banana
- **Category**: dessert
- **Portion**: 1 mangkuk (250ml)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 50g (min: 40, max: 65)
  - Fat: 10g (min: 6, max: 16)
- **Flags**: high_sugar

---

## MORE STREET FOOD

### Sosis Bakar
- **English**: Grilled Sausage
- **Category**: snack
- **Portion**: 2 buah (60g)
- **Nutrition**:
  - Calories: 200 (min: 160, max: 260)
  - Protein: 10g (min: 7, max: 14)
  - Carbs: 8g (min: 4, max: 14)
  - Fat: 15g (min: 10, max: 22)
- **Flags**: processed

### Sate Telur Puyuh
- **English**: Quail Egg Satay
- **Category**: snack
- **Portion**: 5 tusuk (50g)
- **Nutrition**:
  - Calories: 100 (min: 75, max: 130)
  - Protein: 7g (min: 5, max: 10)
  - Carbs: 2g (min: 0, max: 5)
  - Fat: 7g (min: 4, max: 11)

### Cireng
- **English**: Fried Tapioca
- **Category**: snack
- **Portion**: 3 buah (60g)
- **Nutrition**:
  - Calories: 180 (min: 140, max: 230)
  - Protein: 1g (min: 0, max: 3)
  - Carbs: 32g (min: 25, max: 42)
  - Fat: 6g (min: 3, max: 10)

### Cilok
- **English**: Boiled Tapioca Balls
- **Category**: snack
- **Portion**: 5 buah (50g)
- **Nutrition**:
  - Calories: 120 (min: 90, max: 160)
  - Protein: 1g (min: 0, max: 3)
  - Carbs: 28g (min: 22, max: 36)
  - Fat: 1g (min: 0, max: 3)

### Cimol
- **English**: Fried Tapioca Balls
- **Category**: snack
- **Portion**: 5 buah (50g)
- **Nutrition**:
  - Calories: 160 (min: 120, max: 210)
  - Protein: 1g (min: 0, max: 3)
  - Carbs: 28g (min: 22, max: 38)
  - Fat: 5g (min: 3, max: 9)

### Lumpia
- **English**: Spring Roll
- **Category**: snack
- **Portion**: 2 buah (80g)
- **Nutrition**:
  - Calories: 220 (min: 170, max: 280)
  - Protein: 8g (min: 5, max: 12)
  - Carbs: 25g (min: 18, max: 34)
  - Fat: 10g (min: 6, max: 16)

### Pastel
- **English**: Indonesian Pasty
- **Category**: snack
- **Portion**: 2 buah (80g)
- **Nutrition**:
  - Calories: 260 (min: 200, max: 340)
  - Protein: 8g (min: 5, max: 12)
  - Carbs: 28g (min: 20, max: 38)
  - Fat: 13g (min: 8, max: 20)

### Tahu Gejrot
- **English**: Tofu in Sweet Soy
- **Category**: snack
- **Portion**: 1 porsi (100g)
- **Nutrition**:
  - Calories: 150 (min: 110, max: 200)
  - Protein: 10g (min: 7, max: 14)
  - Carbs: 12g (min: 7, max: 18)
  - Fat: 7g (min: 4, max: 12)

### Tahu Sumedang
- **English**: Sumedang Fried Tofu
- **Category**: snack
- **Portion**: 4 buah (80g)
- **Nutrition**:
  - Calories: 180 (min: 140, max: 240)
  - Protein: 12g (min: 8, max: 18)
  - Carbs: 10g (min: 5, max: 16)
  - Fat: 11g (min: 7, max: 17)

### Kentang Goreng
- **English**: French Fries
- **Category**: snack
- **Portion**: 1 porsi (100g)
- **Nutrition**:
  - Calories: 280 (min: 220, max: 360)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 35g (min: 28, max: 45)
  - Fat: 14g (min: 10, max: 20)

### Singkong Goreng
- **English**: Fried Cassava
- **Category**: snack
- **Portion**: 1 porsi (80g)
- **Nutrition**:
  - Calories: 200 (min: 160, max: 260)
  - Protein: 1g (min: 0, max: 3)
  - Carbs: 35g (min: 28, max: 45)
  - Fat: 8g (min: 5, max: 12)

### Ubi Goreng
- **English**: Fried Sweet Potato
- **Category**: snack
- **Portion**: 1 porsi (80g)
- **Nutrition**:
  - Calories: 180 (min: 140, max: 240)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 32g (min: 25, max: 42)
  - Fat: 6g (min: 3, max: 10)

---

## MORE BEVERAGES

### Es Dawet
- **English**: Coconut Cendol Drink
- **Category**: beverage
- **Portion**: 1 gelas (300ml)
- **Nutrition**:
  - Calories: 250 (min: 190, max: 330)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 50g (min: 38, max: 65)
  - Fat: 6g (min: 3, max: 10)
- **Flags**: high_sugar

### Es Kelapa Muda
- **English**: Young Coconut Water
- **Category**: beverage
- **Portion**: 1 buah (300ml)
- **Nutrition**:
  - Calories: 60 (min: 40, max: 90)
  - Protein: 1g (min: 0, max: 2)
  - Carbs: 12g (min: 8, max: 18)
  - Fat: 1g (min: 0, max: 3)
- **Flags**: natural_electrolytes

### Es Degan
- **English**: Coconut Ice
- **Category**: beverage
- **Portion**: 1 gelas (300ml)
- **Nutrition**:
  - Calories: 120 (min: 80, max: 170)
  - Protein: 1g (min: 0, max: 3)
  - Carbs: 22g (min: 15, max: 32)
  - Fat: 4g (min: 2, max: 8)

### Wedang Jahe
- **English**: Ginger Drink
- **Category**: beverage
- **Portion**: 1 gelas (200ml)
- **Nutrition**:
  - Calories: 80 (min: 50, max: 120)
  - Protein: 0g (min: 0, max: 1)
  - Carbs: 20g (min: 12, max: 30)
  - Fat: 0g (min: 0, max: 1)
- **Flags**: warming

### Bandrek
- **English**: Spiced Ginger Drink
- **Category**: beverage
- **Portion**: 1 gelas (200ml)
- **Nutrition**:
  - Calories: 100 (min: 70, max: 140)
  - Protein: 1g (min: 0, max: 2)
  - Carbs: 24g (min: 16, max: 34)
  - Fat: 1g (min: 0, max: 3)
- **Flags**: warming

### Jamu
- **English**: Herbal Drink
- **Category**: beverage
- **Portion**: 1 gelas (150ml)
- **Nutrition**:
  - Calories: 50 (min: 30, max: 80)
  - Protein: 0g (min: 0, max: 1)
  - Carbs: 12g (min: 7, max: 20)
  - Fat: 0g (min: 0, max: 1)
- **Flags**: medicinal

### Jus Mangga
- **English**: Mango Juice
- **Category**: beverage
- **Portion**: 1 gelas (250ml)
- **Nutrition**:
  - Calories: 130 (min: 90, max: 180)
  - Protein: 1g (min: 0, max: 2)
  - Carbs: 32g (min: 22, max: 45)
  - Fat: 0g (min: 0, max: 1)
- **Flags**: vitamin_c

### Jus Jambu
- **English**: Guava Juice
- **Category**: beverage
- **Portion**: 1 gelas (250ml)
- **Nutrition**:
  - Calories: 100 (min: 70, max: 140)
  - Protein: 1g (min: 0, max: 2)
  - Carbs: 24g (min: 16, max: 35)
  - Fat: 0g (min: 0, max: 1)
- **Flags**: vitamin_c

### Es Buah
- **English**: Mixed Fruit Ice
- **Category**: beverage
- **Portion**: 1 mangkuk (250ml)
- **Nutrition**:
  - Calories: 180 (min: 130, max: 250)
  - Protein: 2g (min: 1, max: 4)
  - Carbs: 40g (min: 30, max: 55)
  - Fat: 2g (min: 1, max: 5)
- **Flags**: high_sugar

### Es Doger
- **English**: Bandung Mixed Ice
- **Category**: beverage
- **Portion**: 1 gelas (300ml)
- **Nutrition**:
  - Calories: 220 (min: 170, max: 290)
  - Protein: 3g (min: 2, max: 5)
  - Carbs: 45g (min: 35, max: 60)
  - Fat: 4g (min: 2, max: 8)
- **Flags**: high_sugar

### Susu Kedelai
- **English**: Soy Milk
- **Category**: beverage
- **Portion**: 1 gelas (200ml)
- **Nutrition**:
  - Calories: 80 (min: 50, max: 120)
  - Protein: 7g (min: 5, max: 10)
  - Carbs: 5g (min: 2, max: 10)
  - Fat: 4g (min: 2, max: 7)
- **Flags**: plant_protein

