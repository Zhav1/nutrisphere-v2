'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { InputHTMLAttributes, forwardRef } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

/**
 * AuthInput - Modern input field with glow focus state
 * Features: Bottom border animation, neon glow on focus, icon support
 */
const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon: Icon, error, className = '', ...props }, ref) => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full
              ${Icon ? 'pl-12' : 'pl-4'}
              pr-4
              py-3.5
              bg-white/5
              backdrop-blur-sm
              border-b-2
              border-gray-700
              rounded-lg
              text-white
              placeholder-gray-500
              transition-all
              duration-300
              focus:outline-none
              focus:border-ne on-green
              focus:shadow-[0_4px_20px_rgba(0,255,136,0.3)]
              focus:bg-white/10
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm mt-2"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;
