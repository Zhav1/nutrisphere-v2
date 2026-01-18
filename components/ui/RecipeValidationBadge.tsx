'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

/**
 * Recipe Validation Badge Component
 * Displays validation confidence and warnings for AI-generated recipes
 */

interface RecipeValidation {
    confidence: 'high' | 'medium' | 'low';
    confidenceLabel: string;
    isValid: boolean;
    warnings: string[];
}

interface RecipeValidationBadgeProps {
    validation?: RecipeValidation;
    compact?: boolean;
}

export function RecipeValidationBadge({ validation, compact = false }: RecipeValidationBadgeProps) {
    if (!validation) return null;

    const confidenceColors = {
        high: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
        medium: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Info },
        low: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle },
    };

    const config = confidenceColors[validation.confidence];
    const Icon = config.icon;

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="w-3 h-3" />
                {validation.confidenceLabel}
            </span>
        );
    }

    return (
        <div className="mt-3 space-y-2">
            {/* Confidence Badge */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.text}`} />
                <span className={`text-sm font-medium ${config.text}`}>
                    Harga {validation.confidenceLabel}
                </span>
            </div>

            {/* Warnings */}
            {validation.warnings && validation.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">Catatan:</p>
                            <ul className="list-disc list-inside space-y-1">
                                {validation.warnings.map((warning, idx) => (
                                    <li key={idx}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Mini validation indicator for recipe card headers
 */
interface ValidationDotProps {
    confidence?: 'high' | 'medium' | 'low';
}

export function ValidationDot({ confidence }: ValidationDotProps) {
    if (!confidence) return null;

    const colors = {
        high: 'bg-green-500',
        medium: 'bg-amber-500',
        low: 'bg-red-500',
    };

    const labels = {
        high: 'Harga akurat',
        medium: 'Perlu dicek',
        low: 'Tidak akurat',
    };

    return (
        <div className="flex items-center gap-1.5" title={labels[confidence]}>
            <span className={`w-2 h-2 rounded-full ${colors[confidence]}`} />
            <span className="text-xs text-slate-500">{labels[confidence]}</span>
        </div>
    );
}

export default RecipeValidationBadge;
