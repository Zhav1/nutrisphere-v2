'use client';

import { motion } from 'framer-motion';
import { Mail, Chrome, Shield } from 'lucide-react';
import GlassCard from './GlassCard';

interface OAuthProviderBadgeProps {
  provider: 'google' | 'email';
  className?: string;
}

/**
 * OAuthProviderBadge - Shows authentication method for user
 * Displayed for OAuth users instead of password change section
 */
export default function OAuthProviderBadge({ provider, className = '' }: OAuthProviderBadgeProps) {
  const providerConfig = {
    google: {
      name: 'Google',
      icon: Chrome,
      description: 'Your account is managed by Google. Password management is not available.',
      bgGradient: 'from-blue-100 to-cyan-100',
      iconColor: 'text-blue-600',
      badge: '🔐 Google Account',
      link: 'https://myaccount.google.com/security',
      linkText: 'Manage Google Account',
    },
    email: {
      name: 'Email',
      icon: Mail,
      description: 'Your account uses email and password authentication.',
      bgGradient: 'from-emerald-100 to-teal-100',
      iconColor: 'text-emerald-600',
      badge: '📧 Email Account',
      link: null,
      linkText: '',
    },
  };

  const config = providerConfig[provider];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className={className}
    >
      <GlassCard className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 bg-gradient-to-br ${config.bgGradient} rounded-xl shrink-0`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-slate-800">Authentication Method</h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                {config.badge}
              </span>
            </div>

            <p className="text-slate-600 text-sm mb-4">
              {config.description}
            </p>

            {config.link && (
              <a
                href={config.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                {config.linkText}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
