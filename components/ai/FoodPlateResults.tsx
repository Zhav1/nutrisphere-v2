'use client';

import { motion } from 'framer-motion';
import { FoodPlateAnalysis } from '@/lib/ai/geminiClient';
import AnimatedButton from '@/components/ui/AnimatedButton';
import BackButton from '@/components/ui/BackButton';
import EditableFoodList from '@/components/ai/EditableFoodList';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import { useEditableFoodItems } from '@/lib/hooks/useEditableFoodItems';
import LivingBackground from '@/components/ui/LivingBackground';
import { HEALTH_GRADE_CONFIG } from '@/lib/uiConfig';

interface FoodPlateResultsProps {
  result: FoodPlateAnalysis;
  onSave: (editedResult?: { calories: number; protein_g: number; carbs_g: number; fat_g: number }) => void;
  onRescan: () => void;
}

export default function FoodPlateResults({
  result,
  onSave,
  onRescan,
}: FoodPlateResultsProps) {
  // Use centralized health grade config
  const gradeConfig = HEALTH_GRADE_CONFIG[result.health_grade];

  // Initialize editable food items from AI detection result
  const {
    items,
    totalNutrition,
    isEditing,
    hasChanges,
    startEditing,
    stopEditing,
    addItem,
    removeItem,
    updateItem,
    resetToOriginal,
  } = useEditableFoodItems(result.components_detailed || []);

  // Handle save with edited nutrition if changed
  const handleSave = () => {
    if (hasChanges) {
      onSave(totalNutrition);
    } else {
      onSave();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* LIVING ATMOSPHERE - Same as Dashboard */}
      {/* LIVING ATMOSPHERE */}
      <LivingBackground />

      {/* MAIN CONTENT */}
      <div className="relative z-10 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <BackButton
                variant="light"
                onClick={onRescan}
                label="Scan Ulang"
                position="inline"
              />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Hasil Analisis Makanan
              </h1>
              <p className="text-gray-600">
                Powered by Gemini Vision AI
              </p>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Food Name Header */}
            <div className={`${gradeConfig.bg} p-6 border-b border-gray-200`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {result.food_name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {result.portion_estimate}
                  </p>
                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                    📍 {result.category}
                  </span>
                </div>

                {/* Health Grade Badge */}
                <div className={`bg-gradient-to-br ${gradeConfig.bgGradient} text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg`}>
                  Grade {result.health_grade} {gradeConfig.emoji}
                </div>
              </div>

              {/* Confidence Indicators */}
              <div className="mt-3 space-y-2">
                {/* Validation Confidence (from knowledge base) */}
                {result.confidence && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Validasi:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${result.confidence === 'high' ? 'bg-green-100 text-green-700' :
                        result.confidence === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {result.confidence === 'high' ? '✓ Tinggi' :
                        result.confidence === 'medium' ? '⚠ Sedang' :
                          '⚠ Rendah'}
                    </span>
                  </div>
                )}

                {/* AI Detection Confidence (from Gemini) */}
                {result.overall_confidence !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">AI Confidence:</span>
                    <ConfidenceBadge confidence={result.overall_confidence} size="md" />
                  </div>
                )}
              </div>

              {/* Validation Warnings */}
              {result.validationWarnings && result.validationWarnings.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-medium text-amber-700 mb-1">⚠ Peringatan:</p>
                  <ul className="text-xs text-amber-600 space-y-0.5">
                    {result.validationWarnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Editable Food Components List */}
            {result.components_detailed && result.components_detailed.length > 0 && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <EditableFoodList
                  items={items}
                  isEditing={isEditing}
                  hasChanges={hasChanges}
                  totalNutrition={totalNutrition}
                  onStartEdit={startEditing}
                  onStopEdit={stopEditing}
                  onAddItem={addItem}
                  onRemoveItem={removeItem}
                  onUpdateItem={updateItem}
                  onReset={resetToOriginal}
                />
              </div>
            )}

            {/* Legacy Components List (fallback for backward compatibility) */}
            {!result.components_detailed && result.components && result.components.length > 0 && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Komponen Makanan:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.components.map((component, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-full">
                      {component}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition Facts */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Informasi Nutrisi
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Calories */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                  <div className="text-3xl mb-1">🔥</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {result.calories}
                  </div>
                  <div className="text-sm text-gray-600">Kalori (kkal)</div>
                </div>

                {/* Protein */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="text-3xl mb-1">💪</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.protein_g}g
                  </div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>

                {/* Carbs */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
                  <div className="text-3xl mb-1">🌾</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {result.carbs_g}g
                  </div>
                  <div className="text-sm text-gray-600">Karbohidrat</div>
                </div>

                {/* Fat */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="text-3xl mb-1">🥑</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {result.fat_g}g
                  </div>
                  <div className="text-sm text-gray-600">Lemak</div>
                </div>
              </div>

              {/* Additional nutrients */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Gula</span>
                  <span className="font-semibold text-gray-800">{result.sugar_g}g</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Natrium</span>
                  <span className="font-semibold text-gray-800">{result.sodium_mg ?? 0} mg</span>
                </div>
              </div>
            </div>

            {/* Health Tips */}
            <div className={`p-6 ${gradeConfig.bg} border-t border-gray-200`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${gradeConfig.text} mb-1`}>
                    Tips Kesehatan:
                  </h4>
                  <p className="text-gray-700">
                    {result.health_tips}
                  </p>
                </div>
              </div>
            </div>

            {/* Fun Fact */}
            <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✨</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-700 mb-1">
                    Fun Fact:
                  </h4>
                  <p className="text-gray-700 italic">
                    {result.fun_fact}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <AnimatedButton
              onClick={handleSave}
              variant="neon"
              size="lg"
              glow={true}
              className="w-full"
            >
              💾 Simpan ke Food Log
            </AnimatedButton>

            <AnimatedButton
              onClick={onRescan}
              variant="secondary"
              size="md"
              className="w-full"
            >
              🔄 Scan Lagi
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );
}
