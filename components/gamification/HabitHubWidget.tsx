import { motion } from 'framer-motion';
import { Flame, Zap, CheckCircle2, Lock } from 'lucide-react';
import { useStreakHistory } from '@/lib/hooks/useGamification';
import { format, subDays, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState } from 'react';
import StreakCalendarModal from './StreakCalendarModal';

interface HabitHubWidgetProps {
    streakDays: number;
    dailyCookCount: number;
    userId: string | null;
    streakShieldActive?: boolean;
}

export default function HabitHubWidget({ streakDays, dailyCookCount, userId, streakShieldActive = false }: HabitHubWidgetProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const { data: streakHistory } = useStreakHistory(userId);

    // --- LOGIC: Weekly Strip ---
    // Generate last 7 days (including today) in reverse (Today ... T-6)
    // Actually, distinct visual strips usually go Left -> Right (T-6 ... Today)
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(today, 6 - i); // [T-6, T-5, ... Today]
        return d;
    });

    const isDayCooked = (date: Date) => {
        if (!streakHistory) return false;
        const dateStr = format(date, 'yyyy-MM-dd');
        return streakHistory.some((d) => d.date === dateStr);
    };

    // --- LOGIC: Daily Quota ---
    // Max 5 recipes per day
    const MAX_QUOTA = 5;
    const quotaUsed = Math.min(dailyCookCount, MAX_QUOTA);
    const quotaPercentage = (quotaUsed / MAX_QUOTA) * 100;
    const isLimitReached = quotaUsed >= MAX_QUOTA;

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="h-full"
            >
                <div
                    className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-5 h-full shadow-sm hover:shadow-xl hover:shadow-orange-100 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    onClick={() => setIsCalendarOpen(true)}
                >
                    {/* Background Decorative Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-20 -translate-y-10 translate-x-10 group-hover:opacity-40 transition-opacity" />

                    {/* --- HEADER --- */}
                    <div className="flex items-center justify-between mb-5 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-teal-900 leading-tight">Habit Hub</h3>
                                <p className="text-[10px] text-teal-600 font-medium tracking-wide">
                                    {streakDays} HARI STREAK
                                </p>
                            </div>
                        </div>
                        {/* Streak Shield Indicator */}
                        {streakShieldActive && (
                            <div className="bg-blue-100 px-2 py-1 rounded-full flex items-center gap-1" title="Streak Shield Aktif">
                                <Lock className="w-3 h-3 text-blue-600" />
                                <span className="text-[10px] text-blue-700 font-bold">Safe</span>
                            </div>
                        )}
                    </div>

                    {/* --- 1. WEEKLY STREAK STRIP --- */}
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        {last7Days.map((date, index) => {
                            const isTodayDate = isSameDay(date, today);
                            const cooked = isDayCooked(date);
                            const dayName = format(date, 'iiiiii', { locale: id }); // Min, Sen... (short)

                            return (
                                <div key={index} className="flex flex-col items-center gap-1">
                                    <div
                                        className={`
                                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 relative
                                            ${cooked
                                                ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md shadow-orange-200'
                                                : isTodayDate
                                                    ? 'bg-white border-2 border-dashed border-orange-300 text-orange-400 animate-pulse'
                                                    : 'bg-slate-100 text-slate-400'
                                            }
                                        `}
                                    >
                                        {cooked ? <CheckCircle2 className="w-4 h-4" /> : format(date, 'd')}

                                        {/* Connector Line (except for last one) */}
                                        {index < 6 && (
                                            <div className={`absolute left-full top-1/2 w-2 h-[2px] -translate-y-1/2 z-[-1] ${cooked && isDayCooked(last7Days[index + 1]) ? 'bg-orange-300' : 'bg-slate-100'}`} />
                                        )}
                                    </div>
                                    <span className={`text-[9px] font-medium uppercase ${isTodayDate ? 'text-orange-600' : 'text-slate-400'}`}>
                                        {dayName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* --- 2. DAILY QUOTA GAUGE ("Cooking Energy") --- */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <Zap className={`w-3.5 h-3.5 ${isLimitReached ? 'text-slate-400' : 'text-yellow-500 fill-yellow-500'}`} />
                                <span className="text-xs font-bold text-slate-600">Energi Masak</span>
                            </div>
                            <span className={`text-xs font-bold ${isLimitReached ? 'text-red-500' : 'text-slate-600'}`}>
                                {MAX_QUOTA - quotaUsed}/{MAX_QUOTA} Tersedia
                            </span>
                        </div>

                        {/* Battery Segments */}
                        <div className="flex gap-1 h-3">
                            {Array.from({ length: MAX_QUOTA }).map((_, i) => {
                                // 0, 1, 2, 3, 4
                                // If quotaUsed is 3, then indices 0, 1, 2 are USED (gray/red). 3, 4 are AVAILABLE (green/yellow).
                                // Wait, usually gauges fill up as you use them? Or empty?
                                // "Energy" implies it depletes.
                                // Let's say: 
                                // Used = Empty/Gray
                                // Available = Colored
                                // quotaUsed = 2 -> 2 used, 3 left.
                                // So indices 0,1 are used. 2,3,4 are avaiable.

                                const isUsed = i < quotaUsed;

                                return (
                                    <div
                                        key={i}
                                        className={`
                                            flex-1 rounded-sm transition-all duration-500
                                            ${isUsed
                                                ? 'bg-slate-200'  // Depleted
                                                : 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-sm shadow-yellow-100' // Charged
                                            }
                                        `}
                                    />
                                );
                            })}
                        </div>

                        {isLimitReached && (
                            <p className="text-[10px] text-red-500 mt-1.5 font-medium text-center bg-red-50 py-1 rounded-md">
                                Batas harian tercapai. Istirahat dulu ya! 😴
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>

            <StreakCalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                userId={userId}
                currentStreak={streakDays}
            />
        </>
    );
}

