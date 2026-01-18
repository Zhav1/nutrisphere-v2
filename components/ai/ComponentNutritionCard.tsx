'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import { FoodComponent } from '@/lib/ai/geminiClient';

interface ComponentNutritionCardProps {
  component: FoodComponent;
  index: number;
}

/**
 * Card component showing individual food item nutrition breakdown
 * Expandable to show full nutrition details
 */
export default function ComponentNutritionCard({ component, index }: ComponentNutritionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-800">
            {component.name}
          </span>
          <span className="text-sm text-gray-500">
            {component.portion}
          </span>
          <ConfidenceBadge confidence={component.confidence} />
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-orange-600">
            {component.calories} kkal
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100"
          >
            <div className="p-4 grid grid-cols-3 gap-3">
              {/* Protein */}
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Protein</div>
                <div className="text-lg font-bold text-blue-600">
                  {component.protein_g}g
                </div>
              </div>

              {/* Carbs */}
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Karbo</div>
                <div className="text-lg font-bold text-yellow-600">
                  {component.carbs_g}g
                </div>
              </div>

              {/* Fat */}
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Lemak</div>
                <div className="text-lg font-bold text-purple-600">
                  {component.fat_g}g
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
