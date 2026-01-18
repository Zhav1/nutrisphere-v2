'use client';

import { useState } from 'react';
import { DetectedFood, ObjectDetectionResult } from '@/types/scan';
import { HealthGrade } from '@/types/user';

interface DetectionResultsProps {
  detectedFoods: DetectedFood[];
  onSave: (selectedFoods: DetectedFood[]) => void;
  onRescan: () => void;
}

export default function DetectionResults({
  detectedFoods,
  onSave,
  onRescan,
}: DetectionResultsProps) {
  // Track which foods are selected (all selected by default)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(detectedFoods.map((_, i) => i))
  );

  // Toggle food selection
  const toggleSelection = (index: number) => {
    const newSelection = new Set(selectedIndices);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedIndices(newSelection);
  };

  // Calculate totals from selected foods
  const selectedFoods = detectedFoods.filter((_, i) => selectedIndices.has(i));
  
  const totals = selectedFoods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.nutritionData.calories,
      protein: acc.protein + food.nutritionData.protein,
      carbs: acc.carbs + food.nutritionData.carbs,
      fat: acc.fat + food.nutritionData.fat,
      sugar: acc.sugar + food.nutritionData.sugar,
      sodium: acc.sodium + food.nutritionData.sodium,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, sodium: 0 }
  );

  // Calculate overall health grade based on totals
  const getOverallHealthGrade = (): HealthGrade => {
    // Simple grading based on sugar and sodium totals
    if (totals.sugar > 30 || totals.sodium > 1000) return 'D';
    if (totals.sugar > 20 || totals.sodium > 600) return 'C';
    if (totals.sugar > 10 || totals.sodium > 400) return 'B';
    return 'A';
  };

  const healthGrade = getOverallHealthGrade();
  const gradeColors = {
    A: 'bg-green-500',
    B: 'bg-blue-500',
    C: 'bg-yellow-500',
    D: 'bg-red-500',
  };

  const handleSave = () => {
    if (selectedFoods.length === 0) {
      alert('Pilih minimal 1 item makanan untuk disimpan.');
      return;
    }
    onSave(selectedFoods);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">
          🍽️ Terdeteksi {detectedFoods.length} Item
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {selectedIndices.size === detectedFoods.length 
            ? 'Semua item dipilih' 
            : `${selectedIndices.size} dari ${detectedFoods.length} item dipilih`}
        </p>
      </div>

      {/* Detected Foods List */}
      <div className="p-4 space-y-3">
        {detectedFoods.map((food, index) => {
          const isSelected = selectedIndices.has(index);
          
          return (
            <div
              key={index}
              onClick={() => toggleSelection(index)}
              className={`bg-white rounded-xl p-4 border-2 transition cursor-pointer ${
                isSelected 
                  ? 'border-green-500 shadow-md' 
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div className="flex-shrink-0 pt-1">
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Food Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {food.indonesianName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {food.servingSize}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Confidence: {(food.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {food.nutritionData.calories} kkal
                      </p>
                    </div>
                  </div>

                  {/* Nutrition Details */}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div className="bg-blue-50 rounded px-2 py-1">
                      <p className="text-gray-600">Protein</p>
                      <p className="font-semibold text-blue-700">{food.nutritionData.protein.toFixed(1)}g</p>
                    </div>
                    <div className="bg-yellow-50 rounded px-2 py-1">
                      <p className="text-gray-600">Karbo</p>
                      <p className="font-semibold text-yellow-700">{food.nutritionData.carbs.toFixed(1)}g</p>
                    </div>
                    <div className="bg-red-50 rounded px-2 py-1">
                      <p className="text-gray-600">Lemak</p>
                      <p className="font-semibold text-red-700">{food.nutritionData.fat.toFixed(1)}g</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals Summary - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        {/* Total Nutrition */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-800">Total Nutrisi</h2>
            <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${gradeColors[healthGrade]}`}>
              Grade {healthGrade}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div>
              <p className="text-gray-600 text-xs">Kalori</p>
              <p className="font-bold text-green-600">{totals.calories}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Protein</p>
              <p className="font-bold text-blue-600">{totals.protein.toFixed(1)}g</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Karbo</p>
              <p className="font-bold text-yellow-600">{totals.carbs.toFixed(1)}g</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Lemak</p>
              <p className="font-bold text-red-600">{totals.fat.toFixed(1)}g</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onRescan}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
          >
            🔄 Scan Ulang
          </button>
          <button
            onClick={handleSave}
            disabled={selectedFoods.length === 0}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✅ Simpan ({selectedIndices.size})
          </button>
        </div>

        {/* Helper Text */}
        {selectedIndices.size === 0 && (
          <p className="text-center text-xs text-red-500 mt-2">
            Pilih minimal 1 item untuk menyimpan
          </p>
        )}
      </div>
    </div>
  );
}
