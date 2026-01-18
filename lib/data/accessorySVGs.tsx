'use client';

import React from 'react';

/**
 * Accessory SVG Library - Duolingo-style kawaii accessories
 * Each accessory is designed to fit specific slots on the NutriGotchi avatar
 * 
 * Slot Dimensions (within 100x100 viewBox):
 * - HAT: Centered at top, roughly 40x25
 * - OUTFIT: Overlays lower body, roughly 50x30
 * - PET: Beside avatar, roughly 25x25
 * - BACKGROUND: Full circle behind avatar
 */

// ============================================
// HAT ACCESSORIES
// ============================================

export const ChefHatSVG = ({ size = 40 }: { size?: number }) => (
    <svg width={size} height={size * 0.7} viewBox="0 0 40 28" fill="none">
        {/* Hat base */}
        <ellipse cx="20" cy="24" rx="18" ry="4" fill="#F5F5F5" />
        <rect x="4" y="20" width="32" height="4" fill="#FFFFFF" />
        {/* Puffy top */}
        <ellipse cx="20" cy="12" rx="14" ry="11" fill="#FFFFFF" />
        <ellipse cx="12" cy="10" rx="8" ry="7" fill="#FFFFFF" />
        <ellipse cx="28" cy="10" rx="8" ry="7" fill="#FFFFFF" />
        <ellipse cx="20" cy="6" rx="6" ry="5" fill="#FFFFFF" />
        {/* Highlights */}
        <ellipse cx="14" cy="8" rx="2" ry="1.5" fill="#F0F0F0" opacity="0.6" />
        <ellipse cx="24" cy="6" rx="1.5" ry="1" fill="#F0F0F0" opacity="0.6" />
        {/* Shadow line */}
        <path d="M6 20 Q20 18 34 20" stroke="#E0E0E0" strokeWidth="1" fill="none" />
    </svg>
);

export const CrownSVG = ({ size = 40, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <svg width={size} height={size * 0.6} viewBox="0 0 40 24" fill="none">
        <defs>
            <linearGradient id={`crownGold${instanceId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD54F" />
                <stop offset="100%" stopColor="#FFA000" />
            </linearGradient>
        </defs>
        {/* Crown base */}
        <path
            d="M4 20 L4 10 L12 14 L20 6 L28 14 L36 10 L36 20 Z"
            fill={`url(#crownGold${instanceId})`}
        />
        {/* Jewels */}
        <circle cx="20" cy="12" r="3" fill="#E53935" />
        <circle cx="20" cy="12" r="1.5" fill="#EF5350" />
        <circle cx="10" cy="14" r="2" fill="#1E88E5" />
        <circle cx="30" cy="14" r="2" fill="#43A047" />
        {/* Shine */}
        <ellipse cx="28" cy="14" rx="1" ry="0.5" fill="#FFE082" opacity="0.8" />
    </svg>
);

export const SportsBandSVG = ({ size = 40, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <svg width={size} height={size * 0.4} viewBox="0 0 40 16" fill="none">
        <defs>
            <linearGradient id={`bandRed${instanceId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF5350" />
                <stop offset="100%" stopColor="#C62828" />
            </linearGradient>
        </defs>
        {/* Headband */}
        <rect x="2" y="4" width="36" height="10" rx="5" fill={`url(#bandRed${instanceId})`} />
        {/* Stripe */}
        <rect x="2" y="7" width="36" height="3" fill="#FFFFFF" opacity="0.3" />
        {/* Logo/star */}
        <path d="M20 6 L21 9 L24 9 L21.5 11 L22.5 14 L20 12 L17.5 14 L18.5 11 L16 9 L19 9 Z" fill="#FFD54F" />
    </svg>
);

export const BeanieSVG = ({ size = 40, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <svg width={size} height={size * 0.7} viewBox="0 0 40 28" fill="none">
        <defs>
            <linearGradient id={`beanieBlue${instanceId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#42A5F5" />
                <stop offset="100%" stopColor="#1976D2" />
            </linearGradient>
        </defs>
        {/* Main beanie */}
        <ellipse cx="20" cy="20" rx="18" ry="8" fill={`url(#beanieBlue${instanceId})`} />
        <path d="M4 16 Q4 4 20 4 Q36 4 36 16" fill={`url(#beanieBlue${instanceId})`} />
        {/* Ribbed edge */}
        <path d="M4 18 Q20 22 36 18" stroke="#1565C0" strokeWidth="2" fill="none" />
        {/* Pompom */}
        <circle cx="20" cy="4" r="5" fill="#FF7043" />
        <circle cx="18" cy="3" r="1" fill="#FFAB91" opacity="0.6" />
        {/* Texture lines */}
        <path d="M8 10 Q8 6 20 6 Q32 6 32 10" stroke="#1976D2" strokeWidth="1" fill="none" opacity="0.5" />
    </svg>
);

export const SunglassesSVG = ({ size = 40 }: { size?: number }) => (
    <svg width={size} height={size * 0.4} viewBox="0 0 40 16" fill="none">
        {/* Frames */}
        <rect x="2" y="4" width="14" height="10" rx="3" fill="#1A1A1A" />
        <rect x="24" y="4" width="14" height="10" rx="3" fill="#1A1A1A" />
        {/* Bridge */}
        <path d="M16 8 Q20 6 24 8" stroke="#1A1A1A" strokeWidth="2" fill="none" />
        {/* Lenses shine */}
        <ellipse cx="8" cy="8" rx="4" ry="3" fill="#2196F3" opacity="0.4" />
        <ellipse cx="31" cy="8" rx="4" ry="3" fill="#2196F3" opacity="0.4" />
        <ellipse cx="6" cy="6" rx="1.5" ry="1" fill="#FFFFFF" opacity="0.4" />
        <ellipse cx="29" cy="6" rx="1.5" ry="1" fill="#FFFFFF" opacity="0.4" />
    </svg>
);

export const PartyHatSVG = ({ size = 40, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <svg width={size} height={size * 0.8} viewBox="0 0 40 32" fill="none">
        <defs>
            <linearGradient id={`partyGradient${instanceId}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#E91E63" />
                <stop offset="50%" stopColor="#9C27B0" />
                <stop offset="100%" stopColor="#E91E63" />
            </linearGradient>
        </defs>
        {/* Cone */}
        <path d="M8 28 L20 4 L32 28 Z" fill={`url(#partyGradient${instanceId})`} />
        {/* Stripes */}
        <path d="M12 22 L20 8 L28 22" stroke="#7B1FA2" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M14 18 L20 10 L26 18" stroke="#7B1FA2" strokeWidth="1.5" fill="none" opacity="0.3" />
        {/* Pompom */}
        <circle cx="20" cy="4" r="4" fill="#FFD54F" />
        <circle cx="19" cy="3" r="1" fill="#FFECB3" />
        {/* Dots decoration */}
        <circle cx="12" cy="20" r="1.5" fill="#64B5F6" />
        <circle cx="20" cy="16" r="1.5" fill="#81C784" />
        <circle cx="28" cy="20" r="1.5" fill="#FF8A65" />
    </svg>
);

// ============================================
// OUTFIT ACCESSORIES
// ============================================

export const ApronSVG = ({ size = 50 }: { size?: number }) => (
    <svg width={size} height={size * 0.6} viewBox="0 0 50 30" fill="none">
        {/* Main apron */}
        <path
            d="M10 4 L40 4 L42 8 L42 26 Q25 30 8 26 L8 8 Z"
            fill="#FFFFFF"
        />
        {/* Neck strap */}
        <path d="M18 4 L18 0 L32 0 L32 4" stroke="#E0E0E0" strokeWidth="3" fill="none" />
        {/* Pocket */}
        <rect x="17" y="14" width="16" height="10" rx="2" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="1" />
        {/* Heart decoration */}
        <path d="M25 18 C23 16 20 17 20 19 C20 21 25 24 25 24 C25 24 30 21 30 19 C30 17 27 16 25 18" fill="#EF5350" />
        {/* Side ties */}
        <circle cx="8" cy="10" r="2" fill="#E0E0E0" />
        <circle cx="42" cy="10" r="2" fill="#E0E0E0" />
    </svg>
);

export const HoodieSVG = ({ size = 50, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <svg width={size} height={size * 0.6} viewBox="0 0 50 30" fill="none">
        <defs>
            <linearGradient id={`hoodieGradient${instanceId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5C6BC0" />
                <stop offset="100%" stopColor="#3F51B5" />
            </linearGradient>
        </defs>
        {/* Hood */}
        <path d="M10 15 Q10 2 25 2 Q40 2 40 15" fill="#5C6BC0" />
        {/* Body */}
        <rect x="8" y="12" width="34" height="18" rx="4" fill={`url(#hoodieGradient${instanceId})`} />
        {/* Hood opening */}
        <ellipse cx="25" cy="12" rx="10" ry="6" fill="#3F51B5" />
        {/* Pocket */}
        <rect x="14" y="18" width="22" height="8" rx="2" fill="#3F51B5" opacity="0.5" />
        {/* Drawstrings */}
        <line x1="20" y1="14" x2="18" y2="22" stroke="#9FA8DA" strokeWidth="1.5" />
        <line x1="30" y1="14" x2="32" y2="22" stroke="#9FA8DA" strokeWidth="1.5" />
        <circle cx="18" cy="23" r="1.5" fill="#9FA8DA" />
        <circle cx="32" cy="23" r="1.5" fill="#9FA8DA" />
    </svg>
);

export const JerseySVG = ({ size = 50, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <svg width={size} height={size * 0.6} viewBox="0 0 50 30" fill="none">
        <defs>
            <linearGradient id={`jerseyGradient${instanceId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#43A047" />
                <stop offset="100%" stopColor="#2E7D32" />
            </linearGradient>
        </defs>
        {/* Main jersey */}
        <path d="M8 6 L18 2 L32 2 L42 6 L42 28 L8 28 Z" fill={`url(#jerseyGradient${instanceId})`} />
        {/* Collar */}
        <path d="M18 2 Q25 6 32 2" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        {/* Number */}
        <text x="25" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="Arial">10</text>
        {/* Stripes */}
        <rect x="8" y="24" width="34" height="3" fill="#FFC107" />
    </svg>
);

export const RunningShoeSVG = ({ size = 50, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <svg width={size} height={size * 0.4} viewBox="0 0 50 20" fill="none">
        <defs>
            <linearGradient id={`shoeGradient${instanceId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#424242" />
                <stop offset="100%" stopColor="#212121" />
            </linearGradient>
        </defs>
        {/* Left shoe */}
        <path d="M2 16 L2 10 Q8 6 14 10 L18 10 L20 16 Z" fill={`url(#shoeGradient${instanceId})`} />
        <rect x="2" y="16" width="18" height="3" rx="1" fill="#E0E0E0" />
        <path d="M6 10 L8 14" stroke="#FFFFFF" strokeWidth="1.5" />
        <path d="M10 10 L12 14" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="16" cy="12" r="2" fill="#43A047" />
        {/* Right shoe */}
        <path d="M30 16 L30 10 Q36 6 42 10 L46 10 L48 16 Z" fill={`url(#shoeGradient${instanceId})`} />
        <rect x="30" y="16" width="18" height="3" rx="1" fill="#E0E0E0" />
        <path d="M34 10 L36 14" stroke="#FFFFFF" strokeWidth="1.5" />
        <path d="M38 10 L40 14" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="44" cy="12" r="2" fill="#43A047" />
    </svg>
);

export const SuitSVG = ({ size = 50 }: { size?: number }) => (
    <svg width={size} height={size * 0.6} viewBox="0 0 50 30" fill="none">
        {/* Jacket */}
        <path d="M8 4 L42 4 L44 28 L6 28 Z" fill="#37474F" />
        {/* Lapels */}
        <path d="M18 4 L25 14 L18 28" fill="#263238" />
        <path d="M32 4 L25 14 L32 28" fill="#263238" />
        {/* Shirt */}
        <rect x="22" y="8" width="6" height="20" fill="#FFFFFF" />
        {/* Tie */}
        <path d="M25 8 L27 12 L25 28 L23 12 Z" fill="#C62828" />
        {/* Buttons */}
        <circle cx="25" cy="18" r="1.5" fill="#455A64" />
        <circle cx="25" cy="23" r="1.5" fill="#455A64" />
        {/* Pocket */}
        <rect x="32" y="16" width="6" height="1" fill="#455A64" />
    </svg>
);

export const DressSVG = ({ size = 50, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <svg width={size} height={size * 0.7} viewBox="0 0 50 35" fill="none">
        <defs>
            <linearGradient id={`dressGradient${instanceId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EC407A" />
                <stop offset="100%" stopColor="#C2185B" />
            </linearGradient>
        </defs>
        {/* Dress body */}
        <path d="M18 4 L32 4 L40 32 L10 32 Z" fill={`url(#dressGradient${instanceId})`} />
        {/* Neckline */}
        <path d="M18 4 Q25 8 32 4" fill="#E91E63" />
        {/* Belt/ribbon */}
        <rect x="14" y="12" width="22" height="4" fill="#AD1457" />
        <circle cx="25" cy="14" r="3" fill="#F48FB1" />
        {/* Skirt pleats */}
        <path d="M14 16 L12 32" stroke="#C2185B" strokeWidth="1" opacity="0.3" />
        <path d="M25 16 L25 32" stroke="#C2185B" strokeWidth="1" opacity="0.3" />
        <path d="M36 16 L38 32" stroke="#C2185B" strokeWidth="1" opacity="0.3" />
    </svg>
);

// ============================================
// PET ACCESSORIES
// ============================================

export const ChickSVG = ({ size = 25 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 25 25" fill="none">
        {/* Body */}
        <ellipse cx="12.5" cy="15" rx="9" ry="8" fill="#FFD54F" />
        {/* Head */}
        <circle cx="12.5" cy="8" r="6" fill="#FFD54F" />
        {/* Beak */}
        <path d="M12.5 10 L15 12 L12.5 14 L10 12 Z" fill="#FF9800" />
        {/* Eyes */}
        <circle cx="10" cy="7" r="1.5" fill="#1A1A1A" />
        <circle cx="15" cy="7" r="1.5" fill="#1A1A1A" />
        <circle cx="10.5" cy="6.5" r="0.5" fill="#FFFFFF" />
        <circle cx="15.5" cy="6.5" r="0.5" fill="#FFFFFF" />
        {/* Blush */}
        <ellipse cx="7" cy="9" rx="1.5" ry="1" fill="#FFAB91" opacity="0.6" />
        <ellipse cx="18" cy="9" rx="1.5" ry="1" fill="#FFAB91" opacity="0.6" />
        {/* Wing */}
        <ellipse cx="6" cy="14" rx="3" ry="2" fill="#FFC107" />
        {/* Feet */}
        <path d="M9 22 L8 25 L11 23" stroke="#FF9800" strokeWidth="1.5" fill="none" />
        <path d="M16 22 L17 25 L14 23" stroke="#FF9800" strokeWidth="1.5" fill="none" />
    </svg>
);

export const PuppySVG = ({ size = 25 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 25 25" fill="none">
        {/* Body */}
        <ellipse cx="12.5" cy="18" rx="8" ry="6" fill="#8D6E63" />
        {/* Head */}
        <circle cx="12.5" cy="10" r="7" fill="#A1887F" />
        {/* Ears */}
        <ellipse cx="5" cy="8" rx="3" ry="5" fill="#6D4C41" />
        <ellipse cx="20" cy="8" rx="3" ry="5" fill="#6D4C41" />
        {/* Snout */}
        <ellipse cx="12.5" cy="12" rx="4" ry="3" fill="#D7CCC8" />
        {/* Nose */}
        <ellipse cx="12.5" cy="11" rx="2" ry="1.5" fill="#3E2723" />
        <ellipse cx="12" cy="10.5" rx="0.5" ry="0.3" fill="#5D4037" />
        {/* Eyes */}
        <circle cx="9" cy="8" r="2" fill="#1A1A1A" />
        <circle cx="16" cy="8" r="2" fill="#1A1A1A" />
        <circle cx="9.5" cy="7.5" r="0.7" fill="#FFFFFF" />
        <circle cx="16.5" cy="7.5" r="0.7" fill="#FFFFFF" />
        {/* Tongue */}
        <ellipse cx="12.5" cy="14" rx="1.5" ry="2" fill="#EF5350" />
        {/* Tail */}
        <path d="M20 18 Q24 16 22 12" stroke="#8D6E63" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
);

export const BunnySVG = ({ size = 25 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 25 25" fill="none">
        {/* Ears */}
        <ellipse cx="8" cy="6" rx="3" ry="7" fill="#F5F5F5" />
        <ellipse cx="17" cy="6" rx="3" ry="7" fill="#F5F5F5" />
        <ellipse cx="8" cy="6" rx="1.5" ry="5" fill="#FFCDD2" />
        <ellipse cx="17" cy="6" rx="1.5" ry="5" fill="#FFCDD2" />
        {/* Body */}
        <ellipse cx="12.5" cy="18" rx="7" ry="6" fill="#FAFAFA" />
        {/* Head */}
        <circle cx="12.5" cy="14" r="6" fill="#FFFFFF" />
        {/* Eyes */}
        <circle cx="10" cy="13" r="1.5" fill="#E91E63" />
        <circle cx="15" cy="13" r="1.5" fill="#E91E63" />
        <circle cx="10.3" cy="12.7" r="0.5" fill="#FFFFFF" />
        <circle cx="15.3" cy="12.7" r="0.5" fill="#FFFFFF" />
        {/* Nose */}
        <ellipse cx="12.5" cy="15" rx="1" ry="0.7" fill="#FFCDD2" />
        {/* Whiskers */}
        <line x1="6" y1="14" x2="10" y2="15" stroke="#BDBDBD" strokeWidth="0.5" />
        <line x1="6" y1="16" x2="10" y2="16" stroke="#BDBDBD" strokeWidth="0.5" />
        <line x1="19" y1="14" x2="15" y2="15" stroke="#BDBDBD" strokeWidth="0.5" />
        <line x1="19" y1="16" x2="15" y2="16" stroke="#BDBDBD" strokeWidth="0.5" />
        {/* Feet */}
        <ellipse cx="9" cy="23" rx="2.5" ry="1.5" fill="#F5F5F5" />
        <ellipse cx="16" cy="23" rx="2.5" ry="1.5" fill="#F5F5F5" />
    </svg>
);

export const HamsterSVG = ({ size = 25 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 25 25" fill="none">
        {/* Body */}
        <ellipse cx="12.5" cy="16" rx="9" ry="7" fill="#FFCC80" />
        {/* Head */}
        <circle cx="12.5" cy="11" r="8" fill="#FFE0B2" />
        {/* Ears */}
        <circle cx="5" cy="6" r="3" fill="#FFCC80" />
        <circle cx="20" cy="6" r="3" fill="#FFCC80" />
        <circle cx="5" cy="6" r="1.5" fill="#FFAB91" />
        <circle cx="20" cy="6" r="1.5" fill="#FFAB91" />
        {/* Cheeks (puffy!) */}
        <ellipse cx="6" cy="12" rx="4" ry="3" fill="#FFE0B2" />
        <ellipse cx="19" cy="12" rx="4" ry="3" fill="#FFE0B2" />
        {/* Eyes */}
        <circle cx="9" cy="10" r="2" fill="#1A1A1A" />
        <circle cx="16" cy="10" r="2" fill="#1A1A1A" />
        <circle cx="9.5" cy="9.5" r="0.7" fill="#FFFFFF" />
        <circle cx="16.5" cy="9.5" r="0.7" fill="#FFFFFF" />
        {/* Nose */}
        <ellipse cx="12.5" cy="13" rx="1.5" ry="1" fill="#FF8A65" />
        {/* Mouth */}
        <path d="M11 14 Q12.5 16 14 14" stroke="#BF360C" strokeWidth="0.7" fill="none" />
        {/* Blush */}
        <ellipse cx="6" cy="13" rx="1.5" ry="1" fill="#FFAB91" opacity="0.5" />
        <ellipse cx="19" cy="13" rx="1.5" ry="1" fill="#FFAB91" opacity="0.5" />
        {/* Tiny hands */}
        <ellipse cx="6" cy="18" rx="2" ry="1.5" fill="#FFCC80" />
        <ellipse cx="19" cy="18" rx="2" ry="1.5" fill="#FFCC80" />
    </svg>
);

export const TinySpatulaSVG = ({ size = 25 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 25 25" fill="none">
        {/* Handle */}
        <rect x="10" y="12" width="5" height="12" rx="1" fill="#8D6E63" />
        <rect x="11" y="13" width="1.5" height="10" fill="#A1887F" opacity="0.5" />
        {/* Spatula head */}
        <ellipse cx="12.5" cy="6" rx="8" ry="5" fill="#BDBDBD" />
        <ellipse cx="12.5" cy="6" rx="6" ry="3.5" fill="#E0E0E0" />
        {/* Slots */}
        <rect x="8" y="5" width="3" height="1" rx="0.5" fill="#9E9E9E" />
        <rect x="14" y="5" width="3" height="1" rx="0.5" fill="#9E9E9E" />
        <rect x="11" y="7" width="3" height="1" rx="0.5" fill="#9E9E9E" />
        {/* Shine */}
        <ellipse cx="8" cy="4" rx="1.5" ry="0.7" fill="#FFFFFF" opacity="0.6" />
    </svg>
);

// ============================================
// BACKGROUND ACCESSORIES (Full Scene SVGs)
// ============================================

export const KitchenBackgroundSVG = ({ size = 100, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <>
        <defs>
            <radialGradient id={`kitchenBg${instanceId}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF8E1" />
                <stop offset="100%" stopColor="#FFECB3" />
            </radialGradient>
        </defs>
        {/* Decorative elements rendered in avatar */}
    </>
);

// Kitchen scene elements (for rendering inside avatar background circle)
export const KitchenSceneSVG = ({ size = 100 }: { size?: number }) => (
    <g opacity="0.4">
        {/* Shelf */}
        <rect x="10" y="15" width="80" height="3" fill="#8D6E63" rx="1" />
        {/* Pot */}
        <ellipse cx="25" cy="13" rx="6" ry="2" fill="#795548" />
        <rect x="19" y="8" width="12" height="5" fill="#8D6E63" rx="1" />
        {/* Pan */}
        <ellipse cx="45" cy="12" rx="5" ry="1.5" fill="#424242" />
        <rect x="50" y="11" width="8" height="2" fill="#616161" rx="1" />
        {/* Jar */}
        <rect x="62" y="8" width="8" height="7" fill="#FFCC80" rx="1" />
        <rect x="63" y="6" width="6" height="2" fill="#FF8A65" rx="1" />
        {/* Spoon */}
        <line x1="78" y1="5" x2="78" y2="14" stroke="#BDBDBD" strokeWidth="2" />
        <ellipse cx="78" cy="4" rx="3" ry="2" fill="#E0E0E0" />
        {/* Tiles pattern */}
        <rect x="5" y="85" width="90" height="12" fill="#E0E0E0" opacity="0.5" />
        <line x1="5" y1="91" x2="95" y2="91" stroke="#BDBDBD" strokeWidth="0.5" />
    </g>
);

export const GardenBackgroundSVG = ({ size = 100, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <>
        <defs>
            <radialGradient id={`gardenBg${instanceId}`} cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#B3E5FC" />
                <stop offset="50%" stopColor="#81D4FA" />
                <stop offset="100%" stopColor="#81C784" />
            </radialGradient>
        </defs>
    </>
);

export const GardenSceneSVG = ({ size = 100 }: { size?: number }) => (
    <g opacity="0.5">
        {/* Sun */}
        <circle cx="80" cy="15" r="8" fill="#FFD54F" />
        {/* Cloud */}
        <ellipse cx="25" cy="12" rx="8" ry="4" fill="#FFFFFF" />
        <ellipse cx="30" cy="10" rx="6" ry="3" fill="#FFFFFF" />
        <ellipse cx="20" cy="11" rx="5" ry="3" fill="#FFFFFF" />
        {/* Grass Ground */}
        <ellipse cx="50" cy="92" rx="45" ry="6" fill="#66BB6A" />
        {/* Flowers */}
        <circle cx="20" cy="82" r="3" fill="#F48FB1" />
        <circle cx="20" cy="82" r="1" fill="#FFD54F" />
        <line x1="20" y1="85" x2="20" y2="92" stroke="#4CAF50" strokeWidth="1.5" />

        <circle cx="35" cy="80" r="2.5" fill="#CE93D8" />
        <circle cx="35" cy="80" r="0.8" fill="#FFD54F" />
        <line x1="35" y1="82" x2="35" y2="90" stroke="#4CAF50" strokeWidth="1.5" />

        <circle cx="70" cy="81" r="3" fill="#EF5350" />
        <circle cx="70" cy="81" r="1" fill="#FFC107" />
        <line x1="70" y1="84" x2="70" y2="92" stroke="#4CAF50" strokeWidth="1.5" />
        {/* Butterfly */}
        <ellipse cx="60" cy="25" rx="2" ry="3" fill="#AB47BC" />
        <ellipse cx="64" cy="25" rx="2" ry="3" fill="#AB47BC" />
        <line x1="62" y1="23" x2="62" y2="28" stroke="#7B1FA2" strokeWidth="1" />
    </g>
);

export const BeachBackgroundSVG = ({ size = 100, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <>
        <defs>
            <radialGradient id={`beachBg${instanceId}`} cx="50%" cy="20%" r="80%">
                <stop offset="0%" stopColor="#4FC3F7" />
                <stop offset="50%" stopColor="#29B6F6" />
                <stop offset="100%" stopColor="#FFE082" />
            </radialGradient>
        </defs>
    </>
);

export const BeachSceneSVG = ({ size = 100 }: { size?: number }) => (
    <g opacity="0.5">
        {/* Sun */}
        <circle cx="75" cy="12" r="10" fill="#FFD54F" />
        <circle cx="75" cy="12" r="7" fill="#FFEB3B" />
        {/* Water waves */}
        <path d="M5 60 Q15 55 25 60 Q35 65 45 60 Q55 55 65 60 Q75 65 85 60 Q95 55 100 60"
            stroke="#4FC3F7" strokeWidth="2" fill="none" />
        <path d="M5 65 Q15 60 25 65 Q35 70 45 65 Q55 60 65 65 Q75 70 85 65 Q95 60 100 65"
            stroke="#81D4FA" strokeWidth="2" fill="none" />
        {/* Sand */}
        <ellipse cx="50" cy="92" rx="45" ry="8" fill="#FFE082" />
        {/* Palm tree trunk */}
        <path d="M15 92 Q18 75 12 55" stroke="#8D6E63" strokeWidth="4" fill="none" />
        {/* Palm leaves */}
        <path d="M12 55 Q5 50 2 60" stroke="#66BB6A" strokeWidth="2" fill="none" />
        <path d="M12 55 Q8 45 15 40" stroke="#66BB6A" strokeWidth="2" fill="none" />
        <path d="M12 55 Q20 48 28 55" stroke="#66BB6A" strokeWidth="2" fill="none" />
        <path d="M12 55 Q18 60 10 68" stroke="#66BB6A" strokeWidth="2" fill="none" />
        {/* Seashell */}
        <ellipse cx="70" cy="88" rx="4" ry="2" fill="#FFCCBC" />
        <path d="M66 88 Q70 85 74 88" stroke="#FFAB91" strokeWidth="0.5" fill="none" />
        {/* Starfish */}
        <path d="M85 85 L87 82 L86 86 L89 87 L86 88 L87 91 L85 88 L82 91 L83 87 L80 86 L83 85 Z" fill="#EF9A9A" />
    </g>
);

export const MountainBackgroundSVG = ({ size = 100, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <>
        <defs>
            <linearGradient id={`mountainBg${instanceId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E3F2FD" />
                <stop offset="40%" stopColor="#90CAF9" />
                <stop offset="100%" stopColor="#4CAF50" />
            </linearGradient>
        </defs>
    </>
);

export const MountainSceneSVG = ({ size = 100 }: { size?: number }) => (
    <g opacity="0.5">
        {/* Mountains */}
        <path d="M-5 70 L25 25 L55 70 Z" fill="#78909C" />
        <path d="M25 25 L20 35 L30 35 Z" fill="#ECEFF1" />
        <path d="M35 70 L60 35 L85 70 Z" fill="#607D8B" />
        <path d="M60 35 L55 42 L65 42 Z" fill="#ECEFF1" />
        <path d="M70 70 L90 45 L105 70 Z" fill="#78909C" />
        {/* Pine trees */}
        <path d="M15 90 L20 75 L25 90 Z" fill="#2E7D32" />
        <rect x="18.5" y="90" width="3" height="5" fill="#5D4037" />
        <path d="M75 88 L80 70 L85 88 Z" fill="#388E3C" />
        <rect x="78.5" y="88" width="3" height="5" fill="#5D4037" />
        {/* Grass */}
        <ellipse cx="50" cy="93" rx="45" ry="5" fill="#66BB6A" />
        {/* Bird */}
        <path d="M40 20 Q45 15 50 20" stroke="#37474F" strokeWidth="1" fill="none" />
        <path d="M55 25 Q60 20 65 25" stroke="#37474F" strokeWidth="1" fill="none" />
    </g>
);

export const CityBackgroundSVG = ({ size = 100, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <>
        <defs>
            <linearGradient id={`cityBg${instanceId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1A237E" />
                <stop offset="50%" stopColor="#303F9F" />
                <stop offset="100%" stopColor="#5C6BC0" />
            </linearGradient>
        </defs>
    </>
);

export const CitySceneSVG = ({ size = 100 }: { size?: number }) => (
    <g opacity="0.4">
        {/* Moon */}
        <circle cx="80" cy="15" r="8" fill="#FFF9C4" />
        <circle cx="82" cy="13" r="6" fill="#1A237E" />
        {/* Stars */}
        <circle cx="20" cy="10" r="1" fill="#FFFFFF" />
        <circle cx="35" cy="18" r="0.8" fill="#FFFFFF" />
        <circle cx="50" cy="8" r="1.2" fill="#FFFFFF" />
        <circle cx="65" cy="22" r="0.7" fill="#FFFFFF" />
        <circle cx="15" cy="25" r="0.9" fill="#FFFFFF" />
        {/* Buildings */}
        <rect x="5" y="50" width="12" height="45" fill="#37474F" />
        <rect x="7" y="52" width="3" height="3" fill="#FFF59D" />
        <rect x="12" y="52" width="3" height="3" fill="#FFF59D" opacity="0.5" />
        <rect x="7" y="58" width="3" height="3" fill="#FFF59D" opacity="0.5" />
        <rect x="12" y="58" width="3" height="3" fill="#FFF59D" />

        <rect x="20" y="40" width="15" height="55" fill="#455A64" />
        <rect x="22" y="42" width="3" height="3" fill="#FFF59D" />
        <rect x="27" y="42" width="3" height="3" fill="#FFF59D" opacity="0.5" />
        <rect x="32" y="42" width="3" height="3" fill="#FFF59D" />
        <rect x="22" y="48" width="3" height="3" fill="#FFF59D" opacity="0.5" />
        <rect x="27" y="48" width="3" height="3" fill="#FFF59D" />
        <rect x="27" y="54" width="3" height="3" fill="#FFF59D" opacity="0.5" />

        <rect x="40" y="55" width="10" height="40" fill="#546E7A" />
        <rect x="42" y="57" width="2" height="2" fill="#FFF59D" />
        <rect x="46" y="57" width="2" height="2" fill="#FFF59D" opacity="0.5" />
        <rect x="42" y="62" width="2" height="2" fill="#FFF59D" opacity="0.5" />

        <rect x="55" y="45" width="18" height="50" fill="#37474F" />
        <rect x="58" y="48" width="3" height="3" fill="#FFF59D" />
        <rect x="63" y="48" width="3" height="3" fill="#FFF59D" opacity="0.5" />
        <rect x="68" y="48" width="3" height="3" fill="#FFF59D" />
        <rect x="58" y="55" width="3" height="3" fill="#FFF59D" opacity="0.5" />
        <rect x="63" y="55" width="3" height="3" fill="#FFF59D" />

        <rect x="78" y="60" width="14" height="35" fill="#455A64" />
        <rect x="80" y="62" width="3" height="3" fill="#FFF59D" />
        <rect x="85" y="62" width="3" height="3" fill="#FFF59D" opacity="0.5" />
        <rect x="80" y="68" width="3" height="3" fill="#FFF59D" opacity="0.5" />
        <rect x="85" y="68" width="3" height="3" fill="#FFF59D" />
    </g>
);

export const SpaceBackgroundSVG = ({ size = 100, instanceId = '' }: { size?: number; instanceId?: string }) => (
    <>
        <defs>
            <radialGradient id={`spaceBg${instanceId}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1A237E" />
                <stop offset="100%" stopColor="#0D1B3E" />
            </radialGradient>
        </defs>
    </>
);

export const SpaceSceneSVG = ({ size = 100 }: { size?: number }) => (
    <g opacity="0.6">
        {/* Stars - different sizes */}
        <circle cx="10" cy="15" r="1" fill="#FFFFFF" />
        <circle cx="25" cy="8" r="0.7" fill="#FFFFFF" />
        <circle cx="40" cy="20" r="1.2" fill="#FFFFFF" />
        <circle cx="55" cy="5" r="0.8" fill="#FFFFFF" />
        <circle cx="70" cy="15" r="1" fill="#FFFFFF" />
        <circle cx="85" cy="10" r="0.6" fill="#FFFFFF" />
        <circle cx="15" cy="35" r="0.9" fill="#FFFFFF" />
        <circle cx="90" cy="30" r="1.1" fill="#FFFFFF" />
        <circle cx="5" cy="50" r="0.7" fill="#FFFFFF" />
        <circle cx="95" cy="55" r="0.8" fill="#FFFFFF" />
        <circle cx="20" cy="75" r="1" fill="#FFFFFF" />
        <circle cx="80" cy="80" r="0.6" fill="#FFFFFF" />
        {/* Twinkling stars (bigger) */}
        <path d="M30 45 L31 42 L32 45 L35 46 L32 47 L31 50 L30 47 L27 46 Z" fill="#FFFFFF" />
        <path d="M75 35 L76 33 L77 35 L79 36 L77 37 L76 39 L75 37 L73 36 Z" fill="#FFFFFF" />
        {/* Planet (Saturn-like) */}
        <circle cx="70" cy="70" r="8" fill="#CE93D8" />
        <ellipse cx="70" cy="70" rx="14" ry="3" fill="none" stroke="#E1BEE7" strokeWidth="1.5" transform="rotate(-15 70 70)" />
        {/* Small planet */}
        <circle cx="20" cy="20" r="4" fill="#EF9A9A" />
        <circle cx="18" cy="19" r="1" fill="#FFCDD2" opacity="0.6" />
        {/* Shooting star */}
        <line x1="50" y1="25" x2="60" y2="35" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
        <circle cx="50" cy="25" r="1.5" fill="#FFFFFF" />
    </g>
);

// ============================================
// ACCESSORY REGISTRY
// Maps accessory names to their SVG components
// ============================================

export type AccessorySVGComponent = React.FC<{ size?: number; instanceId?: string }>;

export const ACCESSORY_COMPONENTS: Record<string, AccessorySVGComponent> = {
    // Hats
    'Chef Hat': ChefHatSVG,
    'Crown': CrownSVG,
    'Sports Band': SportsBandSVG,
    'Beanie': BeanieSVG,
    'Sunglasses': SunglassesSVG,
    'Party Hat': PartyHatSVG,

    // Outfits
    'Apron': ApronSVG,
    'Hoodie': HoodieSVG,
    'Jersey': JerseySVG,
    'Running Shoes': RunningShoeSVG,
    'Suit': SuitSVG,
    'Dress': DressSVG,

    // Pets
    'Chick': ChickSVG,
    'Puppy': PuppySVG,
    'Bunny': BunnySVG,
    'Hamster': HamsterSVG,
    'Tiny Spatula': TinySpatulaSVG,
};

export const BACKGROUND_GRADIENTS: Record<string, string> = {
    'Kitchen Background': 'url(#kitchenBg)',
    'Garden Background': 'url(#gardenBg)',
    'Beach': 'url(#beachBg)',
    'Mountain': 'url(#mountainBg)',
    'City': 'url(#cityBg)',
    'Space': 'url(#spaceBg)',
};

// Helper function to get accessory component
export function getAccessoryComponent(name: string): AccessorySVGComponent | null {
    return ACCESSORY_COMPONENTS[name] || null;
}

// Helper to check if accessory has SVG
export function hasAccessorySVG(name: string): boolean {
    return name in ACCESSORY_COMPONENTS || name in BACKGROUND_GRADIENTS;
}
