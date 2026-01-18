/**
 * Date Utilities for NutriSphere
 * Standardizes Timezone Handling to WIB (UTC+7)
 */

// Indonesia uses WIB (Waktu Indonesia Barat) which is UTC+7
const WIB_OFFSET_HOURS = 7;
const WIB_OFFSET_MS = WIB_OFFSET_HOURS * 60 * 60 * 1000;

/**
 * Get current time in WIB (UTC+7)
 * Returns a Date object adjusted to WIB time
 */
export function getWIBDate(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + WIB_OFFSET_MS);
}

/**
 * Get accurate "Today" string for Database storage (YYYY-MM-DD)
 * Based on WIB timezone
 */
export function getWIBTodayString(): string {
  const wibDate = getWIBDate();
  const year = wibDate.getFullYear();
  const month = String(wibDate.getMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string matches today (in WIB)
 */
export function isTodayWIB(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return dateStr === getWIBTodayString();
}

/**
 * Check if a date string matches yesterday (in WIB)
 */
export function isYesterdayWIB(dateStr: string | null): boolean {
  if (!dateStr) return false;
  
  const wibDate = getWIBDate();
  wibDate.setDate(wibDate.getDate() - 1); // Subtract 1 day
  
  const year = wibDate.getFullYear();
  const month = String(wibDate.getMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getDate()).padStart(2, '0');
  const yesterdayStr = `${year}-${month}-${day}`;
  
  return dateStr === yesterdayStr;
}
