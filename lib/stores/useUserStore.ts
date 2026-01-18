import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, NutriGotchiState } from '@/types/user';
interface UserState {
  user: UserProfile | null;
  actions: {
    setUser: (user: UserProfile) => void;
    updateWallet: (amount: number) => void;
    addSavings: (savingsRp: number) => void;
    updateNutriGotchi: (update: Partial<NutriGotchiState>) => void;
    incrementRecipeCount: () => void;
    updateStreak: () => void;
    logout: () => void;
  };
}
const defaultNutriGotchi: NutriGotchiState = {
  level: 1,
  currentXp: 0,
  maxXp: 100,
  mood: 'neutral',
  health: 100,
  accessories: [],
};
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      
      actions: {
        setUser: (user: UserProfile) => {
          set({ user });
        },
        
        updateWallet: (amount: number) => {
          set(state => {
            if (!state.user) return state;
            return {
              user: {
                ...state.user,
                walletBalance: state.user.walletBalance + amount,
              },
            };
          });
        },
        
        addSavings: (savingsRp: number) => {
          // Convert real savings to virtual gold (1 Rp = 0.1 Gold)
          const goldEarned = Math.floor(savingsRp * 0.1);
          
          set(state => {
            if (!state.user) return state;
            return {
              user: {
                ...state.user,
                totalSavingsRp: state.user.totalSavingsRp + savingsRp,
                walletBalance: state.user.walletBalance + goldEarned,
              },
            };
          });
        },
        
        updateNutriGotchi: (update: Partial<NutriGotchiState>) => {
          set(state => {
            if (!state.user) return state;
            
            const updatedGotchi = {
              ...state.user.nutriGotchi,
              ...update,
            };
            
            // Auto-level up logic
            if (updatedGotchi.currentXp >= updatedGotchi.maxXp) {
              updatedGotchi.level += 1;
              updatedGotchi.currentXp = 0;
              updatedGotchi.maxXp = updatedGotchi.level * 100;
            }
            
            return {
              user: {
                ...state.user,
                nutriGotchi: updatedGotchi,
              },
            };
          });
        },
        
        incrementRecipeCount: () => {
          set(state => {
            if (!state.user) return state;
            return {
              user: {
                ...state.user,
                stats: {
                  ...state.user.stats,
                  recipesCooked: state.user.stats.recipesCooked + 1,
                },
              },
            };
          });
        },
        
        updateStreak: () => {
          // TODO: Implement streak logic with last login date
          set(state => {
            if (!state.user) return state;
            return {
              user: {
                ...state.user,
                stats: {
                  ...state.user.stats,
                  streakDays: state.user.stats.streakDays + 1,
                },
              },
            };
          });
        },
        
        logout: () => {
          set({ user: null });
        },
      },
    }),
    {
      name: 'nutrisphere-user-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
// Selector hooks
export const useUser = () => useUserStore(state => state.user);
export const useWalletBalance = () => useUserStore(state => state.user?.walletBalance ?? 0);
export const useNutriGotchi = () => useUserStore(state => state.user?.nutriGotchi ?? defaultNutriGotchi);
export const useUserActions = () => useUserStore(state => state.actions);
