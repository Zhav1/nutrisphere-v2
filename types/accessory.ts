/**
 * Accessory Types for NutriGotchi Shop
 * Matches the `accessories` table in Supabase
 */

export type AccessoryCategory = 'hat' | 'outfit' | 'background' | 'pet' | 'consumable';

export interface Accessory {
  id: string;
  name: string;
  description: string | null;
  category: AccessoryCategory;
  price_gold: number;
  image_url: string | null;
  is_available: boolean;
  required_level: number;
  created_at: string;
}

/**
 * User's owned/equipped accessories
 * Stored in profiles.accessories as JSONB array of IDs
 */
export interface OwnedAccessory {
  accessory_id: string;
  equipped: boolean;
  purchased_at: string;
}

/**
 * Equipped accessories by category (one per category)
 * Stored in profiles.equipped_accessories as JSONB object
 */
export interface EquippedAccessories {
  hat?: string;      // accessory ID
  outfit?: string;   // accessory ID  
  background?: string; // accessory ID
  pet?: string;      // accessory ID
}
