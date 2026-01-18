import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Shield, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, isToday, isFuture, subMonths, addMonths, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState } from 'react';
import { useStreakHistory } from '@/lib/hooks/useGamification';

interface StreakCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    currentStreak: number;
}

export default function StreakCalendarModal({ isOpen, onClose, userId, currentStreak }: StreakCalendarModalProps) {
    const [viewDate, setViewDate] = useState(new Date());
    const { data: streakHistory } = useStreakHistory(userId);

    // Helper to check if a specific date was a "cooked" day
    const isCookedDay = (date: Date) => {
        if (!streakHistory) return false;
        const dateStr = format(date, 'yyyy-MM-dd');
        const found = streakHistory.some((d) => d.date === dateStr);
        // Debug: Log today's check
        if (isToday(date)) {
            console.log('[StreakCalendar] Today check:', { dateStr, streakHistoryDates: streakHistory.map(d => d.date), found });
        }
        return found;
    };

    const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
    const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

    // Generate days for the grid
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate day offset for starting grid (0 = Sunday, 1 = Monday, etc.)
    const startDayOffset = monthStart.getDay();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85dvh]"
                        >
                            {/* Header - Streak Summary */}
                            <div className="bg-gradient-to-br from-orange-400 to-red-500 p-6 text-white text-center relative overflow-hidden">
                                {/* Background Pattern */}
                                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                                    <Flame className="w-64 h-64 -translate-y-10 translate-x-10" />
                                </div>

                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-20"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                                        <Flame className="w-8 h-8 text-white fill-white animate-pulse" />
                                    </div>
                                    <h2 className="text-4xl font-bold mb-1">{currentStreak}</h2>
                                    <p className="text-orange-50 font-medium">Hari Streak Aktif</p>
                                    <p className="text-xs text-orange-100 mt-2 opacity-80">
                                        Masak setiap hari untuk menjaga streakmu! 🔥
                                    </p>
                                </div>
                            </div>

                            {/* Calendar Controls */}
                            <div className="p-6 overflow-y-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <button
                                        onClick={handlePrevMonth}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                                    </button>
                                    <h3 className="text-lg font-bold text-slate-800">
                                        {format(viewDate, 'MMMM yyyy', { locale: id })}
                                    </h3>
                                    <button
                                        onClick={handleNextMonth}
                                        disabled={isFuture(addMonths(viewDate, 1)) && !isSameDay(startOfMonth(new Date()), startOfMonth(addMonths(viewDate, 1)))}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-5 h-5 text-slate-600" />
                                    </button>
                                </div>

                                {/* Day Names */}
                                <div className="grid grid-cols-7 mb-2">
                                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                                        <div key={day} className="text-center text-xs font-bold text-slate-400 py-1">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-2 mb-6">
                                    {/* Empty slots for start offset */}
                                    {Array.from({ length: startDayOffset }).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}

                                    {/* Days */}
                                    {daysInMonth.map((date) => {
                                        const isCooked = isCookedDay(date);
                                        const isTodayDate = isToday(date);
                                        const isFutureDate = isFuture(date);

                                        return (
                                            <div
                                                key={date.toString()}
                                                className="aspect-square relative flex items-center justify-center"
                                            >
                                                <div
                                                    className={`
                              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                              ${isCooked
                                                            ? 'bg-orange-500 text-white shadow-md shadow-orange-200 scale-105'
                                                            : isTodayDate
                                                                ? 'bg-slate-100 ring-2 ring-orange-200 text-slate-700'
                                                                : 'text-slate-500'
                                                        }
                              ${isFutureDate ? 'opacity-30' : ''}
                            `}
                                                >
                                                    {isCooked ? (
                                                        <Flame className="w-5 h-5 fill-white" />
                                                    ) : (
                                                        format(date, 'd')
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* MILESTONES SECTION */}
                                <div className="border-t border-slate-100 pt-6">
                                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-orange-500" />
                                        Bonus Streak
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { days: 7, bonus: '10%' },
                                            { days: 14, bonus: '20%' },
                                            { days: 30, bonus: '50%' }
                                        ].map((milestone) => {
                                            const isUnlocked = currentStreak >= milestone.days;
                                            return (
                                                <div
                                                    key={milestone.days}
                                                    className={`
                                                        rounded-xl p-3 text-center border transition-colors
                                                        ${isUnlocked
                                                            ? 'bg-orange-50 border-orange-200'
                                                            : 'bg-slate-50 border-slate-100 opacity-60'
                                                        }
                                                    `}
                                                >
                                                    <p className={`text-xs font-bold ${isUnlocked ? 'text-orange-600' : 'text-slate-400'}`}>
                                                        {milestone.days} Hari
                                                    </p>
                                                    <p className={`text-lg font-black ${isUnlocked ? 'text-orange-500' : 'text-slate-300'}`}>
                                                        +{milestone.bonus}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500">XP Boost</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
