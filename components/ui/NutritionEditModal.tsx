'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw } from 'lucide-react';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  sodium: number;
}

interface NutritionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NutritionData) => void;
  initialData: NutritionData;
}

/**
 * NutritionEditModal - Edit nutrition values before saving
 */
export default function NutritionEditModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: NutritionEditModalProps) {
  const [data, setData] = useState<NutritionData>(initialData);

  // Reset data when modal opens with new initialData
  useEffect(() => {
    if (isOpen) {
      setData(initialData);
    }
  }, [isOpen, initialData]);

  const handleChange = (field: keyof NutritionData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleReset = () => {
    setData(initialData);
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  const fields: { key: keyof NutritionData; label: string; unit: string; max: number; color: string }[] = [
    { key: 'calories', label: 'Kalori', unit: 'kcal', max: 2000, color: 'emerald' },
    { key: 'protein', label: 'Protein', unit: 'g', max: 100, color: 'blue' },
    { key: 'carbs', label: 'Karbohidrat', unit: 'g', max: 300, color: 'amber' },
    { key: 'fat', label: 'Lemak', unit: 'g', max: 100, color: 'orange' },
    { key: 'sugar', label: 'Gula', unit: 'g', max: 100, color: 'pink' },
    { key: 'sodium', label: 'Natrium', unit: 'mg', max: 2400, color: 'purple' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] z-50 mx-auto max-w-md overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Edit Nutrisi</h2>
                  <p className="text-xs text-gray-500">Koreksi nilai jika perlu</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          {field.label}
                        </label>
                        <span className="text-xs text-gray-400">{field.unit}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={data[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          min={0}
                          max={field.max}
                          step={field.key === 'calories' || field.key === 'sodium' ? 1 : 0.1}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 text-base font-medium focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                        />
                        {/* Visual indicator */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-xl overflow-hidden">
                          <motion.div
                            className={`h-full bg-${field.color}-500`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((data[field.key] / field.max) * 100, 100)}%` }}
                            transition={{ duration: 0.3 }}
                            style={{
                              backgroundColor: field.color === 'emerald' ? '#10b981' :
                                             field.color === 'blue' ? '#3b82f6' :
                                             field.color === 'amber' ? '#f59e0b' :
                                             field.color === 'orange' ? '#f97316' :
                                             field.color === 'pink' ? '#ec4899' :
                                             '#8b5cf6'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 px-4 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                  <motion.button
                    onClick={handleSave}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-[2] py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
