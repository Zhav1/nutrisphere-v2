'use client';

import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { DailyNutrition } from '@/lib/hooks/useHistory';
import ChartSkeleton from './ChartSkeleton';

interface NutritionTrendChartProps {
    data: DailyNutrition[];
    isLoading: boolean;
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
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-600">{entry.name}:</span>
                        <span className="font-bold text-slate-900">
                            {Math.round(entry.value)}{entry.name === 'Kalori' ? ' kkal' : 'g'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function NutritionTrendChart({ data, isLoading }: NutritionTrendChartProps) {
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

    if (isLoading) {
        return <ChartSkeleton height="h-64" />;
    }

    if (data.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center">
                <span className="text-4xl mb-3">📊</span>
                <p className="text-teal-700 font-medium">Belum ada data nutrisi</p>
                <p className="text-teal-600 text-sm">Scan makanan untuk mulai tracking!</p>
            </div>
        );
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCarbs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
                    <Legend
                        wrapperStyle={{ paddingTop: 10 }}
                        iconType="circle"
                        iconSize={8}
                    />
                    <Area
                        type="monotone"
                        dataKey="protein"
                        name="Protein"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorProtein)"
                    />
                    <Area
                        type="monotone"
                        dataKey="carbs"
                        name="Karbohidrat"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCarbs)"
                    />
                    <Area
                        type="monotone"
                        dataKey="fat"
                        name="Lemak"
                        stroke="#f97316"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorFat)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
