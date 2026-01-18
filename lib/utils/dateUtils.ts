/**
 * Get current date in YYYY-MM-DD format using LOCAL timezone
 * NOT UTC timezone (which toISOString() uses)
 * 
 * This is critical for daily reset logic to work correctly
 * for users in non-UTC timezones.
 * 
 * Example:
 * - User in UTC+7 at 2025-12-14 00:57 local time
 * - new Date().toISOString() returns '2025-12-13T17:57:00.000Z' (UTC - WRONG!)
 * - getTodayLocalDate() returns '2025-12-14' (LOCAL - CORRECT!)
 * 
 * IMPORTANT: We format the date string directly from local components
 * without using toISOString() which converts to UTC
 */
export function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string is before today (local timezone)
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns true if dateStr is before today
 */
export function isBeforeToday(dateStr: string): boolean {
  return dateStr < getTodayLocalDate();
}
