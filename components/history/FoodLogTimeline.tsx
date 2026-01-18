'use client';

import { motion } from 'framer-motion';
import { Camera, Utensils, Edit3, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { FoodLogEntry } from '@/lib/hooks/useHistory';

interface FoodLogTimelineProps {
    data: { date: string; logs: FoodLogEntry[] }[];
    isLoading: boolean;
}

// Get icon based on source
function getSourceIcon(source: string) {
    switch (source) {
        case 'vision_scan':
        case 'ocr_scan':
            return <Camera className="w-4 h-4" />;
        case 'recipe':
            return <Utensils className="w-4 h-4" />;
        case 'manual':
            return <Edit3 className="w-4 h-4" />;
        default:
            return <Sparkles className="w-4 h-4" />;
    }
}

// Get source label
function getSourceLabel(source: string) {
    switch (source) {
        case 'vision_scan':
            return 'Scan Makanan';
        case 'ocr_scan':
            return 'Scan Label';
        case 'recipe':
            return 'Resep';
        case 'manual':
            return 'Manual';
        default:
            return 'Lainnya';
    }
}

// Get health grade color
function getGradeColor(grade: string | null) {
    switch (grade) {
        case 'A':
            return 'bg-emerald-100 text-emerald-700';
        case 'B':
            return 'bg-lime-100 text-lime-700';
        case 'C':
            return 'bg-amber-100 text-amber-700';
        case 'D':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-gray-100 text-gray-500';
    }
}

// Single log entry component
function LogEntry({ log }: { log: FoodLogEntry }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/40 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    {/* Source Icon */}
                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                        {getSourceIcon(log.source)}
                    </div>

                    <div>
                        <p className="font-medium text-teal-900 text-sm line-clamp-1">{log.food_name}</p>
                        <p className="text-xs text-teal-600">{getSourceLabel(log.source)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {log.health_grade && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getGradeColor(log.health_grade)}`}>
                            {log.health_grade}
                        </span>
                    )}
                    <span className="text-sm font-semibold text-orange-500">{log.calories} kkal</span>
                    {expanded ? (
                        <ChevronUp className="w-4 h-4 text-teal-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-teal-400" />
                    )}
                </div>
            </div>

            {/* Expanded details */}
            {expanded && (
                <motion.div
                    className="mt-3 pt-3 border-t border-teal-100 grid grid-cols-3 gap-2 text-center"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                >
                    <div>
                        <p className="text-xs text-teal-600">Protein</p>
                        <p className="text-sm font-medium text-cyan-600">{Math.round(log.protein)}g</p>
                    </div>
                    <div>
                        <p className="text-xs text-teal-600">Karbo</p>
                        <p className="text-sm font-medium text-amber-600">{Math.round(log.carbs)}g</p>
                    </div>
                    <div>
                        <p className="text-xs text-teal-600">Lemak</p>
                        <p className="text-sm font-medium text-orange-600">{Math.round(log.fat)}g</p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

// Date group component with collapsible feature
function DateGroup({ date, logs }: { date: string; logs: FoodLogEntry[] }) {
    const isToday = new Date(date).toDateString() === new Date().toDateString();
    const [isExpanded, setIsExpanded] = useState(isToday); // Today expanded by default
    
    const formattedDate = new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);

    return (
        <div className="space-y-2">
            {/* Date Header - Clickable */}
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-teal-50/50 transition-colors group"
                whileTap={{ scale: 0.99 }}
            >
                <div className="flex items-center gap-2">
                    <motion.div 
                        className={`w-2.5 h-2.5 rounded-full ${isToday ? 'bg-emerald-500' : 'bg-teal-300'}`}
                        animate={{ scale: isToday ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 2, repeat: isToday ? Infinity : 0 }}
                    />
                    <h4 className="text-sm font-semibold text-teal-900">
                        {isToday ? '📅 Hari Ini' : formattedDate}
                    </h4>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="text-xs text-teal-600 bg-teal-100 px-2 py-1 rounded-full">
                        {logs.length} entri • {totalCalories} kkal
                    </span>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-teal-500 group-hover:text-teal-700"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </div>
            </motion.button>

            {/* Collapsible Logs */}
            <motion.div
                initial={false}
                animate={{
                    height: isExpanded ? 'auto' : 0,
                    opacity: isExpanded ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
            >
                <div className="space-y-2 ml-4 pl-4 border-l-2 border-emerald-200 pb-2">
                    {logs.map((log) => (
                        <LogEntry key={log.id} log={log} />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export default function FoodLogTimeline({ data, isLoading }: FoodLogTimelineProps) {
    const [showAll, setShowAll] = useState(false);

    // Limit to 5 days by default
    const displayData = showAll ? data : data.slice(0, 5);

    // Calculate quick stats
    const allLogs = data.flatMap(d => d.logs);
    const todayLogs = data.find(d => new Date(d.date).toDateString() === new Date().toDateString())?.logs || [];
    const totalCaloriesToday = todayLogs.reduce((sum, log) => sum + log.calories, 0);
    const totalEntriesToday = todayLogs.length;
    const avgGrade = allLogs.length > 0 
        ? allLogs.filter(l => l.health_grade).reduce((acc, l) => {
            const gradeMap: Record<string, number> = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
            return acc + (gradeMap[l.health_grade || ''] || 0);
        }, 0) / allLogs.filter(l => l.health_grade).length
        : 0;
    const avgGradeLetter = avgGrade >= 3.5 ? 'A' : avgGrade >= 2.5 ? 'B' : avgGrade >= 1.5 ? 'C' : avgGrade > 0 ? 'D' : '-';

    if (isLoading) {
        return (
            <div className="min-h-[280px] space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-4 w-32 bg-teal-100 rounded mb-2" />
                        <div className="h-16 bg-teal-50 rounded-xl" />
                    </div>
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="min-h-[280px] flex flex-col items-center justify-center text-center py-8">
                <span className="text-5xl mb-4">🍽️</span>
                <p className="text-teal-700 font-medium">Belum ada riwayat makanan</p>
                <p className="text-teal-600 text-sm">Scan makanan untuk mulai tracking!</p>
            </div>
        );
    }

    return (
        <div className="min-h-[280px] space-y-4">
            {/* Quick Stats Summary */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
                <div className="text-center">
                    <p className="text-2xl font-bold text-orange-500">{totalCaloriesToday}</p>
                    <p className="text-xs text-teal-600">kkal hari ini</p>
                </div>
                <div className="text-center border-x border-teal-200">
                    <p className="text-2xl font-bold text-teal-600">{totalEntriesToday}</p>
                    <p className="text-xs text-teal-600">entri hari ini</p>
                </div>
                <div className="text-center">
                    <p className={`text-2xl font-bold ${avgGradeLetter === 'A' ? 'text-emerald-500' : avgGradeLetter === 'B' ? 'text-lime-500' : avgGradeLetter === 'C' ? 'text-amber-500' : avgGradeLetter === 'D' ? 'text-red-500' : 'text-gray-400'}`}>
                        {avgGradeLetter}
                    </p>
                    <p className="text-xs text-teal-600">rata-rata grade</p>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
                {displayData.map(({ date, logs }) => (
                    <DateGroup key={date} date={date} logs={logs} />
                ))}
            </div>

            {/* Show more button */}
            {data.length > 5 && (
                <motion.button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full py-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    {showAll ? 'Tampilkan Lebih Sedikit' : `Lihat ${data.length - 5} hari lainnya`}
                </motion.button>
            )}
        </div>
    );
}
