'use client';

import React from 'react';
import { ImageQualityResult, getQualityIndicatorColor, getIssueTitle } from '@/lib/validation/imageQualityCheck';

interface QualityIndicatorProps {
    quality: ImageQualityResult | null;
    isAnalyzing: boolean;
    compact?: boolean;
}

/**
 * Real-time quality indicator component for camera view
 * Shows green/yellow/red dot with optional score
 */
export function QualityIndicator({ quality, isAnalyzing, compact = false }: QualityIndicatorProps) {
    if (isAnalyzing) {
        return (
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse" />
                {!compact && <span className="text-white text-xs">Menganalisis...</span>}
            </div>
        );
    }

    if (!quality) {
        return null;
    }

    const color = getQualityIndicatorColor(quality.overallScore);
    const colorClasses = {
        green: 'bg-emerald-500',
        yellow: 'bg-amber-400',
        red: 'bg-red-500',
    };

    const glowClasses = {
        green: 'shadow-emerald-500/50',
        yellow: 'shadow-amber-400/50',
        red: 'shadow-red-500/50',
    };

    return (
        <div className={`flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full ${quality.isAcceptable ? '' : 'animate-pulse'}`}>
            <div
                className={`w-3 h-3 rounded-full ${colorClasses[color]} shadow-lg ${glowClasses[color]}`}
            />
            {!compact && (
                <span className="text-white text-xs font-medium">
                    {quality.isAcceptable ? 'Siap scan' : 'Perbaiki foto'}
                </span>
            )}
        </div>
    );
}

interface QualityWarningModalProps {
    quality: ImageQualityResult;
    onRetry: () => void;
    onProceedAnyway: () => void;
    onClose: () => void;
}

/**
 * Modal shown when image quality is poor
 * Gives user choice to retry or proceed anyway
 */
export function QualityWarningModal({ quality, onRetry, onProceedAnyway, onClose }: QualityWarningModalProps) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                        Kualitas Foto Kurang Baik
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                        Hasil analisis mungkin kurang akurat
                    </p>
                </div>

                {/* Issues List */}
                <div className="bg-amber-50 rounded-xl p-4 mb-4">
                    <p className="text-amber-800 text-sm font-medium mb-2">Masalah terdeteksi:</p>
                    <ul className="space-y-1">
                        {quality.issues.map((issue, idx) => (
                            <li key={idx} className="text-amber-700 text-sm flex items-start gap-2">
                                <span>•</span>
                                <span>{getIssueTitle(issue)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Suggestions */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <p className="text-blue-800 text-sm font-medium mb-2">Tips perbaikan:</p>
                    <ul className="space-y-1">
                        {quality.suggestions.slice(0, 2).map((suggestion, idx) => (
                            <li key={idx} className="text-blue-700 text-sm flex items-start gap-2">
                                <span>💡</span>
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Quality Score */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="text-gray-500 text-sm">Skor kualitas:</span>
                    <span className={`font-bold ${quality.overallScore >= 70 ? 'text-emerald-600' :
                        quality.overallScore >= 40 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                        {quality.overallScore}/100
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onRetry}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                    >
                        📷 Foto Ulang
                    </button>
                    <button
                        onClick={onProceedAnyway}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
                    >
                        Lanjutkan
                    </button>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
