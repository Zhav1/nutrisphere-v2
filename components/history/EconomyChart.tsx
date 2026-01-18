'use client';

import { useMemo } from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { EconomyDataPoint } from '@/lib/hooks/useHistory';
import ChartSkeleton from './ChartSkeleton';

interface EconomyChartProps {
    data: EconomyDataPoint[];
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
                            {entry.name.includes('Rp')
                                ? `Rp ${entry.value.toLocaleString('id-ID')}`
                                : entry.value.toLocaleString('id-ID')}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function EconomyChart({ data, isLoading }: EconomyChartProps) {
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
                <span className="text-4xl mb-3">🪙</span>
                <p className="text-teal-700 font-medium">Belum ada data ekonomi</p>
                <p className="text-teal-600 text-sm">Masak resep untuk mulai mengumpulkan Gold!</p>
            </div>
        );
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.3} />
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
                        yAxisId="left"
                        tick={{ fontSize: 11, fill: '#5eead4' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11, fill: '#5eead4' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={{ stroke: '#cbd5e1' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: 10 }}
                        iconType="circle"
                        iconSize={8}
                    />
                    <Bar
                        yAxisId="left"
                        dataKey="goldEarned"
                        name="Gold Earned"
                        fill="url(#colorGold)"
                        radius={[4, 4, 0, 0]}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="cumulativeSavings"
                        name="Total Hemat (Rp)"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
