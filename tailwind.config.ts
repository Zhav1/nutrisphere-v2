import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        
        // Primary Palette (Keep existing + enhance)
        primary: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        secondary: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        
        // Neon Palette (Gen-Z Vibrant)
        neon: {
          green: '#00ff88',
          purple: '#a78bfa',
          orange: '#fb923c',
          blue: '#60a5fa',
          pink: '#f472b6',
        },
        
        // Glassmorphism Backgrounds
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.1)',
        },
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-sunset': 'linear-gradient(to right, #ff6b6b, #feca57, #48dbfb)',
        'gradient-ocean': 'linear-gradient(135deg, #667eea 0%, #48dbfb 100%)',
        'gradient-fire': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.4)',
        'glow-purple': '0 0 20px rgba(167, 139, 250, 0.4)',
        'glow-orange': '0 0 20px rgba(251, 146, 60, 0.4)',
        'glow-blue': '0 0 20px rgba(96, 165, 250, 0.4)',
        'lift': '0 20px 60px rgba(0, 0, 0, 0.15)',
        'lift-lg': '0 30px 80px rgba(0, 0, 0, 0.2)',
      },
      
      backdropBlur: {
        xs: '2px',
      },
      
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
