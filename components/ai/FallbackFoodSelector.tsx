'use client';

import React, { useState, useMemo } from 'react';
import { FOOD_CALORIE_MAP, FoodCalorieData } from '@/lib/data/foodCalories';
import { NutritionalInfo } from '@/types/scan';

interface FallbackFoodSelectorProps {
    onSelect: (food: FoodCalorieData, portion: number) => void;
    onManualEntry: () => void;
    onClose: () => void;
    reason?: 'timeout' | 'low_quality' | 'api_error';
}

// Food categories for organization
const CATEGORIES = [
    { id: 'popular', label: '🔥 Populer', icon: '🔥' },
    { id: 'staples', label: '🍚 Makanan Pokok', icon: '🍚' },
    { id: 'proteins', label: '🍗 Lauk Pauk', icon: '🍗' },
    { id: 'vegetables', label: '🥬 Sayuran', icon: '🥬' },
    { id: 'soups', label: '🍜 Sup & Soto', icon: '🍜' },
    { id: 'snacks', label: '🍟 Cemilan', icon: '🍟' },
    { id: 'beverages', label: '🥤 Minuman', icon: '🥤' },
] as const;

// Map foods to categories
const CATEGORY_MAP: Record<string, string[]> = {
    popular: ['nasi_putih', 'ayam_goreng', 'nasi_goreng', 'mie_instan', 'telur_ceplok', 'es_teh_manis'],
    staples: ['nasi_putih', 'nasi_goreng', 'mie_goreng', 'mie_instan', 'bubur_ayam', 'lontong'],
    proteins: ['ayam_goreng', 'ayam_bakar', 'rendang', 'telur_ceplok', 'telur_balado', 'telur_dadar', 'ikan_goreng', 'ikan_bakar', 'tempe_goreng', 'tahu_goreng', 'sate_ayam'],
    vegetables: ['sayur_asem', 'sayur_lodeh', 'tumis_kangkung', 'cap_cay', 'gado_gado', 'pecel', 'lalapan'],
    soups: ['soto_ayam', 'sop_buntut', 'bakso', 'rawon'],
    snacks: ['gorengan', 'kerupuk', 'martabak_manis', 'pisang_goreng'],
    beverages: ['es_teh_manis', 'kopi_susu', 'es_jeruk', 'jus_alpukat', 'air_putih'],
};

const REASON_MESSAGES: Record<string, string> = {
    timeout: 'Analisis AI terlalu lama',
    low_quality: 'Kualitas foto kurang baik',
    api_error: 'Server sedang sibuk',
};

/**
 * Fallback food selector when AI analysis fails or times out
 * Provides quick-select from common Indonesian foods
 */
export default function FallbackFoodSelector({
    onSelect,
    onManualEntry,
    onClose,
    reason = 'timeout'
}: FallbackFoodSelectorProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('popular');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFood, setSelectedFood] = useState<string | null>(null);
    const [portion, setPortion] = useState(1);

    // Get foods for current category or search
    const displayedFoods = useMemo(() => {
        const allFoods = Object.entries(FOOD_CALORIE_MAP);

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return allFoods.filter(([key, food]) =>
                food.indonesianName.toLowerCase().includes(query) ||
                food.englishName.toLowerCase().includes(query) ||
                key.includes(query)
            );
        }

        const categoryKeys = CATEGORY_MAP[selectedCategory] || [];
        return allFoods.filter(([key]) => categoryKeys.includes(key));
    }, [selectedCategory, searchQuery]);

    const handleFoodSelect = (key: string) => {
        setSelectedFood(key);
    };

    const handleConfirm = () => {
        if (selectedFood && FOOD_CALORIE_MAP[selectedFood]) {
            onSelect(FOOD_CALORIE_MAP[selectedFood], portion);
        }
    };

    const selectedFoodData = selectedFood ? FOOD_CALORIE_MAP[selectedFood] : null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl w-full max-w-lg h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Pilih Makanan</h2>
                            <p className="text-sm text-gray-500">{REASON_MESSAGES[reason]}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Cari makanan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {/* Category Pills */}
                {!searchQuery && (
                    <div className="px-4 py-3 overflow-x-auto flex gap-2 border-b border-gray-100 scrollbar-hide">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Food Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {displayedFoods.length === 0 ? (
                        <div className="text-center py-8">
                            <span className="text-4xl mb-2 block">🤔</span>
                            <p className="text-gray-500">Tidak ditemukan</p>
                            <button
                                onClick={onManualEntry}
                                className="mt-4 text-emerald-600 font-medium hover:underline"
                            >
                                Input manual →
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {displayedFoods.map(([key, food]) => (
                                <button
                                    key={key}
                                    onClick={() => handleFoodSelect(key)}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${selectedFood === key
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <p className="font-medium text-gray-900 text-sm leading-tight">
                                        {food.indonesianName}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {food.nutritionData.calories} kcal
                                    </p>
                                    <div className={`inline-block mt-1 px-1.5 py-0.5 rounded text-xs font-medium ${food.healthGrade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                            food.healthGrade === 'B' ? 'bg-blue-100 text-blue-700' :
                                                food.healthGrade === 'C' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                        }`}>
                                        {food.healthGrade}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Selected Food & Actions */}
                {selectedFoodData && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        {/* Portion Selector */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">Porsi:</span>
                            <div className="flex gap-2">
                                {[0.5, 1, 1.5, 2].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPortion(p)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${portion === p
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'
                                            }`}
                                    >
                                        {p}x
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Nutrition Summary */}
                        <div className="flex items-center gap-4 mb-3 text-sm">
                            <span className="font-medium text-gray-900">{selectedFoodData.indonesianName}</span>
                            <span className="text-gray-500">
                                {Math.round(selectedFoodData.nutritionData.calories * portion)} kcal
                            </span>
                            <span className="text-gray-500">
                                P: {Math.round(selectedFoodData.nutritionData.protein * portion)}g
                            </span>
                        </div>

                        {/* Confirm Button */}
                        <button
                            onClick={handleConfirm}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            ✓ Simpan
                        </button>
                    </div>
                )}

                {/* Manual Entry CTA (when no food selected) */}
                {!selectedFoodData && (
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={onManualEntry}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors"
                        >
                            📊 Input Kalori Manual
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// Manual Entry Component
// ============================================================================

interface ManualNutritionEntryProps {
    onSave: (nutrition: NutritionalInfo, name: string) => void;
    onClose: () => void;
}

export function ManualNutritionEntry({ onSave, onClose }: ManualNutritionEntryProps) {
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');

    const handleSave = () => {
        const nutrition: NutritionalInfo = {
            calories: parseInt(calories) || 0,
            protein: parseFloat(protein) || 0,
            carbs: parseFloat(carbs) || 0,
            fat: parseFloat(fat) || 0,
            sugar: 0, // Default
            sodium: 0, // Default
        };
        onSave(nutrition, name || 'Makanan Manual');
    };

    const isValid = parseInt(calories) > 0;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Input Manual</h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-600 block mb-1">Nama Makanan</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="contoh: Nasi + Ayam"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 block mb-1">Kalori (kcal) *</label>
                        <input
                            type="number"
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                            placeholder="300"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm text-gray-600 block mb-1">Protein (g)</label>
                            <input
                                type="number"
                                value={protein}
                                onChange={(e) => setProtein(e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 block mb-1">Karbo (g)</label>
                            <input
                                type="number"
                                value={carbs}
                                onChange={(e) => setCarbs(e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 block mb-1">Lemak (g)</label>
                            <input
                                type="number"
                                value={fat}
                                onChange={(e) => setFat(e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isValid}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl font-medium text-white transition-colors"
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}
