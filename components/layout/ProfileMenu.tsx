'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import NutriGotchiAvatar from '@/components/ui/NutriGotchiAvatar';
import { Mood } from '@/types/user';

interface ProfileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    userEmail: string;
    userMood?: Mood;
    userHealth?: number;
    equippedAccessories?: any[];
    onLogout: () => void;
    isLoggingOut: boolean;
}

/**
 * ProfileMenu - Dropdown menu for profile and logout
 * Displayed when user clicks profile button in navbar
 */
export default function ProfileMenu({
    isOpen,
    onClose,
    userName,
    userEmail,
    userMood,
    userHealth,
    equippedAccessories,
    onLogout,
    isLoggingOut,
}: ProfileMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-emerald-500/10 border border-emerald-100/50 overflow-hidden z-50"
                >
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-emerald-100">
                        <div className="flex items-center gap-3">
                            {userMood && userHealth !== undefined && equippedAccessories ? (
                                <NutriGotchiAvatar
                                    size="sm"
                                    mood={userMood}
                                    health={userHealth}
                                    equippedAccessories={equippedAccessories}
                                    showHealthBar={false}
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 truncate">{userName}</p>
                                <p className="text-xs text-slate-600 truncate">{userEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        {/* View Profile */}
                        <Link
                            href="/profile"
                            onClick={onClose}
                            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-emerald-50 transition-colors"
                        >
                            <User className="w-5 h-5 text-emerald-600" />
                            <span className="font-medium">View Profile</span>
                        </Link>

                        {/* Divider */}
                        <div className="mx-4 my-2 border-t border-slate-200" />

                        {/* Logout */}
                        <button
                            onClick={onLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoggingOut ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <LogOut className="w-5 h-5" />
                            )}
                            <span className="font-medium">
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
