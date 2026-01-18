import { motion } from 'framer-motion';

/**
 * Skeleton loader for accessory cards in shop
 * Matches the dimensions and layout of AccessoryCard
 */
export default function AccessoryCardSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg"
        >
            {/* Image skeleton */}
            <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl mb-4 relative overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            {/* Name skeleton */}
            <div className="h-5 bg-slate-300/60 rounded-lg mb-2 w-3/4 relative overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.1 }}
                />
            </div>

            {/* Category skeleton */}
            <div className="h-4 bg-slate-200/60 rounded-lg mb-4 w-1/2 relative overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.2 }}
                />
            </div>

            {/* Price/button skeleton */}
            <div className="h-10 bg-gradient-to-r from-slate-300 to-slate-400 rounded-xl relative overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.3 }}
                />
            </div>
        </motion.div>
    );
}
