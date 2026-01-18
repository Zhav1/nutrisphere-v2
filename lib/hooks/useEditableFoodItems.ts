'use client';

import { useState, useCallback, useMemo } from 'react';
import { FoodComponent } from '@/lib/ai/geminiClient';

interface EditableFoodItem extends FoodComponent {
  id: string;
  isEdited: boolean;
}

interface UseEditableFoodItemsReturn {
  items: EditableFoodItem[];
  totalNutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  isEditing: boolean;
  hasChanges: boolean;
  startEditing: () => void;
  stopEditing: () => void;
  addItem: (item: Omit<FoodComponent, 'confidence'> & { confidence?: number }) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<FoodComponent>) => void;
  resetToOriginal: () => void;
}

/**
 * Custom hook for managing editable food items state
 * Provides add/remove/edit functionality with nutrition recalculation
 * 
 * @param initialItems - Initial food components from AI detection
 * @returns State and actions for managing editable food items
 */
export function useEditableFoodItems(
  initialItems: FoodComponent[] = []
): UseEditableFoodItemsReturn {
  // Convert initial items to editable items with IDs
  const createEditableItems = useCallback((items: FoodComponent[]): EditableFoodItem[] => {
    return items.map((item, index) => ({
      ...item,
      id: `item-${index}-${Date.now()}`,
      isEdited: false,
    }));
  }, []);

  const [originalItems] = useState<EditableFoodItem[]>(() => createEditableItems(initialItems));
  const [items, setItems] = useState<EditableFoodItem[]>(() => createEditableItems(initialItems));
  const [isEditing, setIsEditing] = useState(false);

  // Calculate total nutrition from all items
  const totalNutrition = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein_g: acc.protein_g + (item.protein_g || 0),
        carbs_g: acc.carbs_g + (item.carbs_g || 0),
        fat_g: acc.fat_g + (item.fat_g || 0),
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    );
  }, [items]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (items.length !== originalItems.length) return true;
    return items.some((item) => item.isEdited);
  }, [items, originalItems]);

  // Start editing mode
  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Stop editing mode
  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Add a new food item
  const addItem = useCallback(
    (newItem: Omit<FoodComponent, 'confidence'> & { confidence?: number }) => {
      const editableItem: EditableFoodItem = {
        ...newItem,
        confidence: newItem.confidence ?? 100, // User-added items are 100% confident
        id: `item-new-${Date.now()}`,
        isEdited: true,
      };
      setItems((prev) => [...prev, editableItem]);
    },
    []
  );

  // Remove a food item by ID
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Update a food item's properties
  const updateItem = useCallback((id: string, updates: Partial<FoodComponent>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, isEdited: true } : item
      )
    );
  }, []);

  // Reset to original AI-detected items
  const resetToOriginal = useCallback(() => {
    setItems(originalItems.map(item => ({ ...item, isEdited: false })));
    setIsEditing(false);
  }, [originalItems]);

  return {
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
  };
}
