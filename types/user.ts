export type HealthGrade = 'A' | 'B' | 'C' | 'D';
export type Mood = 'happy' | 'neutral' | 'sick';

export interface NutriGotchiState {
  level: number;
  currentXp: number;
  maxXp: number; // Formula: Level * 100
  mood: Mood;
  health: number; // 0-100
  accessories: string[]; // IDs of equipped items
}
export interface UserProfile {
  uid: string;
  displayName: string;
  walletBalance: number; // Virtual Gold
  totalSavingsRp: number; // Real money saved (Rp)
  stats: {
    streakDays: number;
    recipesCooked: number;
  };
  nutriGotchi: NutriGotchiState;
}
