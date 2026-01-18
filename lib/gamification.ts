/**
 * Gamification Logic for NutriGotchi
 * Centralizes XP, Level Up, and Health Calculations
 */

// --- XP & Leveling ---

/**
 * Calculate Max XP for a given level
 * Formula: Level * 100 (Linear Scaling for better engagement)
 */
export function calculateMaxXp(level: number): number {
  return Math.max(1, level) * 100;
}

/**
 * Calculate New Level and XP after earning rewards
 * Implements STRICT RESET: XP resets to 0 upon leveling up (excess XP is discarded)
 */
export function calculateLevelProgress(
  currentXp: number,
  currentLevel: number,
  xpEarned: number
): { newXp: number; newLevel: number; newMaxXp: number; leveledUp: boolean } {
  let newXp = currentXp + xpEarned;
  let newLevel = currentLevel;
  let newMaxXp = calculateMaxXp(newLevel);
  let leveledUp = false;

  while (newXp >= newMaxXp) {
    newXp = 0; // STRICT RESET - Discard overflow
    newLevel += 1;
    newMaxXp = calculateMaxXp(newLevel);
    leveledUp = true;
  }

  return { newXp, newLevel, newMaxXp, leveledUp };
}


// --- Health & Mood ---

export type HealthGrade = 'A' | 'B' | 'C' | 'D';

interface HealthLog {
  health_grade: string | null; // From DB
}

/**
 * Calculate NutriGotchi Health Score (0-100)
 * Uses "Buffered Average" to prevent instant sickness from one bad meal.
 * Buffer: Adds 5 phantom "Perfect" meals to the average.
 */
export function calculateHealthScore(recentLogs: HealthLog[]): { health: number; mood: 'happy' | 'neutral' | 'sick' } {
  const BUFFER_COUNT = 5;
  const BUFFER_SCORE = 100; // Perfect score buffer
  const INITIAL_BUFFER_SUM = BUFFER_COUNT * BUFFER_SCORE;

  let realSum = 0;
  let realCount = 0;

  if (recentLogs && recentLogs.length > 0) {
    realCount = recentLogs.length;
    recentLogs.forEach(log => {
      // Score mapping
      const score = { 'A': 100, 'B': 75, 'C': 50, 'D': 25 }[log.health_grade as string] || 50;
      realSum += score;
    });
  }

  // Formula: (RealSum + 500) / (RealCount + 5)
  // Ensures heavily weighted "Good Start"
  const healthScore = Math.round((realSum + INITIAL_BUFFER_SUM) / (realCount + BUFFER_COUNT));
  
  // Clamp 0-100
  const finalHealth = Math.max(0, Math.min(100, healthScore));

  // Mood Logic
  let mood: 'happy' | 'neutral' | 'sick' = 'sick';
  if (finalHealth >= 75) mood = 'happy';
  else if (finalHealth >= 40) mood = 'neutral';

  return { health: finalHealth, mood };
}
