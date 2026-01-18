// Helper for consistent currency formatting
export const formatCurrency = (amount: number): string => {
  return `Rp${amount.toLocaleString('id-ID')}`;
};

export const APP_MESSAGES = {
  SUCCESS: {
    RECIPE_COOKED: 'Hore! Masakan berhasil dibuat! 🍳',
    RECIPE_DELETED: 'Resep berhasil dihapus',
    FOOD_LOG_SAVED: 'Data makanan berhasil disimpan',
    PROFILE_UPDATED: 'Profil berhasil diperbarui! ✨',
    PASSWORD_CHANGED: 'Password berhasil diubah! 🔐',
    LOGOUT: 'Sampai jumpa lagi! 👋',
  },
  ERRORS: {
    UNAUTHORIZED: 'Sesi berakhir. Silakan login kembali.',
    GENERIC: 'Terjadi kesalahan. Silakan coba lagi.',
    NOT_FOUND: 'Data tidak ditemukan.',
    DAILY_LIMIT: 'Masakan jadi! Tapi limit harian sudah habis (5/hari). Besok lagi ya! 📅',
    INVALID_INPUT: 'Input tidak valid.',
  },
  GAMIFICATION: {
    LEVEL_UP: (level: number) => `🎉 LEVEL UP! Kamu sekarang Level ${level}!`,
    STREAK_BONUS: (days: number, percent: number) => `🔥 Streak ${days} hari! Bonus XP +${percent}%!`,
    REVIVED: (hp: number) => `🎉 NutriGotchi Bangkit! Selamat datang kembali! HP: ${hp}`,
    STILL_FAINTED: (count: number, max: number) => `Masakan dimakan (${count}/${max} untuk bangkit). NutriGotchi masih pingsan... 💤`,
    RECIPE_DELETED_WITH_STATS: (cooks: number, gold: number, xp: number, savings: number) => 
      `Resep dihapus (${cooks}x dimasak). -${gold}🪙 -${xp}XP -${formatCurrency(savings)}`,
  }
};
