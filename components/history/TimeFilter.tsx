'use client';

import { motion } from 'framer-motion';
import { TimePeriod } from '@/lib/hooks/useHistory';

interface TimeFilterProps {
    value: TimePeriod;
    onChange: (period: TimePeriod) => void;
}

const PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: '7 Hari' },
    { value: '30d', label: '30 Hari' },
    { value: '3m', label: '3 Bulan' },
    { value: '6m', label: '6 Bulan' },
    { value: '1y', label: '1 Tahun' },
    { value: 'all', label: 'Semua' },
];

export default function TimeFilter({ value, onChange }: TimeFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((option) => (
                <motion.button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${value === option.value
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                            : 'bg-white/70 text-teal-700 hover:bg-white hover:shadow-sm border border-white/60'
                        }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {option.label}
                </motion.button>
            ))}
        </div>
    );
}
