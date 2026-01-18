'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Check, RotateCcw } from 'lucide-react';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import { FoodComponent } from '@/lib/ai/geminiClient';

interface EditableFoodItem extends FoodComponent {
  id: string;
  isEdited: boolean;
}

interface EditableFoodListProps {
  items: EditableFoodItem[];
  isEditing: boolean;
  hasChanges: boolean;
  totalNutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  onStartEdit: () => void;
  onStopEdit: () => void;
  onAddItem: (item: Omit<FoodComponent, 'confidence'> & { confidence?: number }) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<FoodComponent>) => void;
  onReset: () => void;
}

// Common Indonesian food presets for quick add
const FOOD_PRESETS: (Omit<FoodComponent, 'confidence'>)[] = [
  { name: 'Nasi Putih', portion: '1 centong', calories: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3 },
  { name: 'Ayam Goreng', portion: '1 potong', calories: 250, protein_g: 25, carbs_g: 5, fat_g: 15 },
  { name: 'Telur Dadar', portion: '1 butir', calories: 150, protein_g: 13, carbs_g: 1, fat_g: 11 },
  { name: 'Tempe Goreng', portion: '2 potong', calories: 100, protein_g: 10, carbs_g: 8, fat_g: 5 },
  { name: 'Tahu Goreng', portion: '2 potong', calories: 80, protein_g: 8, carbs_g: 3, fat_g: 5 },
  { name: 'Sayur Tumis', portion: '1 porsi', calories: 50, protein_g: 2, carbs_g: 8, fat_g: 2 },
  { name: 'Sambal', portion: '1 sdm', calories: 10, protein_g: 0, carbs_g: 2, fat_g: 0 },
  { name: 'Kerupuk', portion: '3 keping', calories: 50, protein_g: 1, carbs_g: 7, fat_g: 2 },
];

/**
 * Editable list of food items with add/remove/edit functionality
 */
export default function EditableFoodList({
  items,
  isEditing,
  hasChanges,
  totalNutrition,
  onStartEdit,
  onStopEdit,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onReset,
}: EditableFoodListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Header with Edit Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          🍽️ Komponen Makanan ({items.length} item)
        </h3>
        
        <div className="flex items-center gap-2">
          {isEditing && hasChanges && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
          
          <button
            onClick={isEditing ? onStopEdit : onStartEdit}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              isEditing
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-3 h-3" />
                Selesai
              </>
            ) : (
              <>
                <Edit2 className="w-3 h-3" />
                Edit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Food Items List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white border rounded-xl p-4 flex items-center justify-between ${
                item.isEdited ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{item.name}</span>
                    {item.isEdited && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        Diedit
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{item.portion}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ConfidenceBadge confidence={item.confidence} size="sm" />
                <span className="font-bold text-orange-600">{item.calories} kcal</span>
                
                {isEditing && (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Hapus item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Item Button (only in edit mode) */}
      {isEditing && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-green-400 hover:text-green-600 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Makanan
        </motion.button>
      )}

      {/* Total Nutrition Summary */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
        <div className="text-sm text-gray-600 mb-2">Total Nutrisi:</div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-orange-600">{totalNutrition.calories}</div>
            <div className="text-xs text-gray-500">Kalori</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">{totalNutrition.protein_g.toFixed(1)}g</div>
            <div className="text-xs text-gray-500">Protein</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600">{totalNutrition.carbs_g.toFixed(1)}g</div>
            <div className="text-xs text-gray-500">Karbo</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{totalNutrition.fat_g.toFixed(1)}g</div>
            <div className="text-xs text-gray-500">Lemak</div>
          </div>
        </div>
      </div>

      {/* Add Food Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[80dvh] overflow-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Tambah Makanan</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Pilih makanan untuk ditambahkan:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {FOOD_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onAddItem(preset);
                        setShowAddModal(false);
                      }}
                      className="p-3 text-left bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl transition"
                    >
                      <div className="font-medium text-gray-800">{preset.name}</div>
                      <div className="text-xs text-gray-500">{preset.portion}</div>
                      <div className="text-xs text-orange-600 mt-1">{preset.calories} kcal</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
