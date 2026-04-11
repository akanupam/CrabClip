import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        crab: {
          coral: '#ff5c5c', // vibrant coral
          'coral-light': '#ff7a7a',
          ocean: '#0ea5e9', // lighter ocean blue
          'ocean-light': '#38bdf8',
          sand: '#f8fafc',
          shell: '#ffffff',
          'deep-sea': '#0f172a',
          'glow': 'rgba(255, 92, 92, 0.15)',
        },
        brand: {
          dark: '#f8fafc',
          surface: '#ffffff',
          panel: 'rgba(255, 255, 255, 0.8)',
          border: 'rgba(0, 0, 0, 0.04)',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        }
      },
      boxShadow: {
        'vibrant': '0 20px 25px -5px rgba(255, 92, 92, 0.1), 0 10px 10px -5px rgba(255, 92, 92, 0.04)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.05), 0 0 40px rgba(255, 92, 92, 0.03)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.5)',
      }
    },
  },
  plugins: [],
}
export default config
