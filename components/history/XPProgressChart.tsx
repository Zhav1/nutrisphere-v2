'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { XPDataPoint } from '@/lib/hooks/useHistory';
import ChartSkeleton from './ChartSkeleton';

interface XPProgressChartProps {
    data: XPDataPoint[];
    isLoading: boolean;
    currentLevel: number;
    currentXp: number;
    maxXp: number;
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;

    // Get the actual date from payload data (not the formatted label)
    const rawDate = payload[0]?.payload?.date;
    const displayDate = rawDate
        ? new Date(rawDate + 'T00:00:00').toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        })
        : label;

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/60">
            <p className="font-semibold text-slate-800 mb-2">
                {displayDate}
            </p>
            <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-slate-600">XP Earned:</span>
                    <span className="font-bold text-slate-900">+{payload[0]?.value || 0} XP</span>
                </div>
                {payload[1] && (
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-500" />
                        <span className="text-slate-600">Cumulative:</span>
                        <span className="font-bold text-slate-900">{payload[1].value} XP</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function XPProgressChart({
    data,
    isLoading,
    currentLevel,
    currentXp,
    maxXp,
}: XPProgressChartProps) {
    // Format data for chart
    const chartData = useMemo(() => {
        return data.map((d) => ({
            ...d,
            dateFormatted: new Date(d.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
            }),
        }));
    }, [data]);

    // Calculate total XP earned in period
    const totalXpInPeriod = useMemo(() => {
        return data.reduce((sum, d) => sum + d.xpEarned, 0);
    }, [data]);

    if (isLoading) {
        return <ChartSkeleton height="h-64" />;
    }

    if (data.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center">
                <span className="text-4xl mb-3">✨</span>
                <p className="text-teal-700 font-medium">Belum ada XP earned</p>
                <p className="text-teal-600 text-sm">Masak resep untuk dapat XP!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Current Level Progress */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-purple-600">Lv.{currentLevel}</span>
                </div>
                <div className="flex-1 h-3 bg-purple-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${(currentXp / maxXp) * 100}%` }}
                    />
                </div>
                <span className="text-sm text-teal-700">{currentXp}/{maxXp} XP</span>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-teal-600">Total XP dalam periode ini:</span>
                <span className="font-bold text-purple-600">+{totalXpInPeriod} XP</span>
            </div>

            {/* Chart */}
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="dateFormatted"
                            tick={{ fontSize: 11, fill: '#5eead4' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                            tickLine={{ stroke: '#cbd5e1' }}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#5eead4' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                            tickLine={{ stroke: '#cbd5e1' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="xpEarned"
                            name="XP Earned"
                            stroke="#a78bfa"
                            strokeWidth={3}
                            dot={{ fill: '#a78bfa', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="cumulativeXp"
                            name="Cumulative XP"
                            stroke="#6366f1"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
