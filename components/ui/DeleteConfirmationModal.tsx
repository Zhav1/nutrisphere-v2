'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import GlassCard from './GlassCard';
import AnimatedButton from './AnimatedButton';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
    isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    isDeleting = false,
}: DeleteConfirmationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isDeleting ? onClose : undefined}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm"
                        >
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 ring-1 ring-black/5">
                                {/* Header Graphic */}
                                <div className="pt-8 pb-4 flex flex-col items-center">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -15 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', duration: 0.6 }}
                                        className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50/50"
                                    >
                                        <Trash2 className="w-10 h-10 text-red-500" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-gray-900 text-center px-4">
                                        {title}
                                    </h3>
                                </div>

                                {/* Content */}
                                <div className="px-6 pb-6 text-center">
                                    <p className="text-gray-600 mb-4 leading-relaxed">
                                        {message}
                                    </p>

                                    {itemName && (
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 mb-4 border border-gray-200">
                                            <p className="font-bold text-gray-800 text-sm">{itemName}</p>
                                        </div>
                                    )}

                                    <p className="text-xs text-red-500 font-medium bg-red-50 py-1 px-3 rounded-full inline-block">
                                        ⚠️ Tindakan ini tidak dapat dibatalkan
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                                    <AnimatedButton
                                        variant="secondary"
                                        onClick={onClose}
                                        disabled={isDeleting}
                                        className="w-full justify-center bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        Batal
                                    </AnimatedButton>
                                    <AnimatedButton
                                        onClick={onConfirm}
                                        isLoading={isDeleting}
                                        className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                                    >
                                        {!isDeleting && <Trash2 className="w-4 h-4 mr-2" />}
                                        {isDeleting ? 'Hapus...' : 'Hapus'}
                                    </AnimatedButton>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
