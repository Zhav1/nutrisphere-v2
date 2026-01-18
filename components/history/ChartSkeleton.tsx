import { motion } from 'framer-motion';

interface ChartSkeletonProps {
    height?: string;
    className?: string;
}

/**
 * Skeleton loader for charts in history page
 * Generic skeleton that adapts to chart dimensions
 */
export default function ChartSkeleton({ height = 'h-64', className = '' }: ChartSkeletonProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg ${height} ${className} relative overflow-hidden`}
        >
            {/* Title skeleton */}
            <div className="h-6 bg-slate-300/60 rounded-lg mb-6 w-1/3 relative overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            {/* Chart area skeleton - bars/lines representation */}
            <div className="flex items-end justify-around gap-2 h-3/4">
                {[0.6, 0.8, 0.7, 0.9, 0.5, 0.75].map((heightPercent, index) => (
                    <div
                        key={index}
                        className="flex-1 bg-gradient-to-t from-teal-300/60 to-teal-200/40 rounded-t-lg relative overflow-hidden"
                        style={{ height: `${heightPercent * 100}%` }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'linear',
                                delay: index * 0.1,
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* X-axis labels skeleton */}
            <div className="flex justify-around mt-2">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-3 bg-slate-200/60 rounded w-8 relative overflow-hidden"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'linear',
                                delay: 0.5 + index * 0.05,
                            }}
                        />
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
