import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Accessory, AccessoryCategory, EquippedAccessories } from '@/types/accessory';

/**
 * Fetch all available accessories from the shop
 */
export function useAccessories() {
  return useQuery({
    queryKey: ['accessories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accessories')
        .select('*')
        .eq('is_available', true)
        .order('category')
        .order('required_level');
      
      if (error) throw error;
      return data as Accessory[];
    },
    staleTime: 10 * 60 * 1000, // Shop items are fresh for 10 minutes
  });
}

/**
 * Fetch accessories by category
 */
export function useAccessoriesByCategory(category: string) {
  return useQuery({
    queryKey: ['accessories', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accessories')
        .select('*')
        .eq('is_available', true)
        .eq('category', category)
        .order('required_level');
      
      if (error) throw error;
      return data as Accessory[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Purchase an accessory - deducts gold and adds to user's inventory
 */
export function usePurchaseAccessory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      accessoryId, 
      price 
    }: { 
      userId: string; 
      accessoryId: string; 
      price: number;
    }) => {
      // 1. Get current profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('wallet_balance, accessories')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // 2. Check if user has enough gold
      if (profile.wallet_balance < price) {
        throw new Error('Insufficient gold balance');
      }
      
      // 3. Get accessory info to check if it's consumable
      const { data: accessory, error: accessoryError } = await supabase
        .from('accessories')
        .select('category, name')
        .eq('id', accessoryId)
        .single();
      
      if (accessoryError) throw accessoryError;
      
      const isConsumable = accessory.category === 'consumable';
      
      // 4. Check if already owned (skip for consumables - they can be re-purchased)
      const currentAccessories: string[] = profile.accessories || [];
      if (!isConsumable && currentAccessories.includes(accessoryId)) {
        throw new Error('Accessory already owned');
      }
      
      // 5. Build update data
      const updateData: Record<string, unknown> = {
        wallet_balance: profile.wallet_balance - price,
      };
      
      // For consumables, just activate the effect (don't add to accessories inventory)
      if (isConsumable) {
        // Check if it's Streak Shield
        if (accessory.name.toLowerCase().includes('streak') || 
            accessory.name.toLowerCase().includes('shield')) {
          updateData.streak_shield_active = true;
          console.log('[PURCHASE] 🛡️ Streak Shield purchased and activated!');
        }
      } else {
        // For regular accessories, add to inventory
        updateData.accessories = [...currentAccessories, accessoryId];
      }
      
      // 6. Update profile
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate profile and accessories cache
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
    },
  });
}

/**
 * Toggle equip/unequip an accessory
 * Only one accessory per category can be equipped at a time
 */
export function useToggleEquipAccessory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      accessory,
      equip,
    }: {
      userId: string;
      accessory: Accessory;
      equip: boolean;
    }) => {
      // Get current equipped accessories
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('equipped_accessories')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentEquipped: EquippedAccessories = profile.equipped_accessories || {};
      let newEquipped: EquippedAccessories;
      
      // Build update object
      const updateData: Record<string, unknown> = {};
      
      if (equip) {
        // Equip this accessory (replaces any existing in same category)
        newEquipped = {
          ...currentEquipped,
          [accessory.category]: accessory.id,
        };
        
        // Special handling for consumable items (like Streak Shield)
        if (accessory.category === 'consumable') {
          // Check if it's the Streak Shield accessory
          if (accessory.name.toLowerCase().includes('streak') || 
              accessory.name.toLowerCase().includes('shield')) {
            updateData.streak_shield_active = true;
          }
        }
      } else {
        // Unequip this accessory
        newEquipped = { ...currentEquipped };
        delete newEquipped[accessory.category as keyof EquippedAccessories];
        
        // Special handling for consumable items
        if (accessory.category === 'consumable') {
          if (accessory.name.toLowerCase().includes('streak') || 
              accessory.name.toLowerCase().includes('shield')) {
            updateData.streak_shield_active = false;
          }
        }
      }
      
      updateData.equipped_accessories = newEquipped;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['equipped-accessories', variables.userId] });
    },
  });
}

/**
 * Get user's owned accessories with full details
 */
export function useOwnedAccessories(userId: string | null, ownedIds: string[]) {
  return useQuery({
    queryKey: ['owned-accessories', userId, ownedIds],
    queryFn: async () => {
      if (ownedIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('accessories')
        .select('*')
        .in('id', ownedIds);
      
      if (error) throw error;
      return data as Accessory[];
    },
    enabled: !!userId && ownedIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get user's equipped accessories with full details
 */
export function useEquippedAccessories(userId: string | null, equippedMap: EquippedAccessories | null) {
  const equippedIds = equippedMap 
    ? Object.values(equippedMap).filter(Boolean) as string[]
    : [];
    
  return useQuery({
    queryKey: ['equipped-accessories', userId, equippedIds],
    queryFn: async () => {
      if (equippedIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('accessories')
        .select('*')
        .in('id', equippedIds);
      
      if (error) throw error;
      return data as Accessory[];
    },
    enabled: !!userId && equippedIds.length > 0,
    staleTime: 30 * 1000, // 30 seconds - reduced to prevent mobile/desktop mismatch
    refetchOnWindowFocus: true, // Refetch when user returns to tab/app
  });
}

/**
 * @deprecated Use useToggleEquipAccessory instead
 * Old equip accessory hook - kept for backward compatibility
 */
export function useEquipAccessory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      accessoryId,
      equip,
    }: {
      userId: string;
      accessoryId: string;
      equip: boolean;
    }) => {
      // Get current accessories
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('accessories')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      let accessories: string[] = profile.accessories || [];
      
      if (equip) {
        // Add if not present
        if (!accessories.includes(accessoryId)) {
          accessories = [...accessories, accessoryId];
        }
      } else {
        // Remove if present
        accessories = accessories.filter(id => id !== accessoryId);
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ accessories })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
    },
  });
}
