import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import scrollbar from 'tailwind-scrollbar';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: 'var(--radius)',
        lg: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 8px)',
        sm: 'calc(var(--radius) - 12px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      colors: {
        background_page: 'hsl(var(--bg-page))',
        background: 'hsl(var(--bg))',
        foreground: 'hsl(var(--fg))',
        brand: {
          50: 'hsl(var(--brand-50))',
          100: 'hsl(var(--brand-100))',
          200: 'hsl(var(--brand-200))',
          300: 'hsl(var(--brand-300))',
          400: 'hsl(var(--brand-400))',
          500: 'hsl(var(--brand-500))',
          600: 'hsl(var(--brand-600))',
          700: 'hsl(var(--brand-700))',
          800: 'hsl(var(--brand-800))',
          900: 'hsl(var(--brand-900))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-fg))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-fg))',
        },
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        danger: 'hsl(var(--danger))',
        info: 'hsl(var(--brand-500))',
        // Weather-specific colors
        weather: {
          sunny: 'hsl(45 93% 47%)',
          cloudy: 'hsl(220 9% 70%)',
          rainy: 'hsl(210 83% 53%)',
          stormy: 'hsl(260 75% 65%)',
          snowy: 'hsl(200 100% 97%)',
          foggy: 'hsl(220 9% 70%)',
          windy: 'hsl(188 94% 43%)',
          hot: 'hsl(0 84% 60%)',
          cold: 'hsl(210 83% 53%)',
        },
        // UI element colors
        ui: {
          humidity: 'hsl(210 83% 53%)',
          wind: 'hsl(188 94% 43%)',
          visibility: 'hsl(38 92% 50%)',
          sunrise: 'hsl(30 80% 65%)',
          sunset: 'hsl(260 75% 65%)',
          'temp-high': 'hsl(0 84% 60%)',
          'temp-low': 'hsl(210 83% 53%)',
        },
        // Legacy compatibility
        primary: {
          DEFAULT: 'hsl(var(--brand-500))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        input: 'hsl(var(--input))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      boxShadow: {
        sm: 'var(--shadow-1)',
        xl: 'var(--shadow-2)',
        // Elevation system
        'elevation-0': 'none',
        'elevation-1': '0 1px 2px hsl(0 0% 0% / 0.06), 0 1px 3px hsl(0 0% 0% / 0.04)',
        'elevation-2': '0 4px 6px hsl(0 0% 0% / 0.07), 0 2px 4px hsl(0 0% 0% / 0.05)',
        'elevation-3': '0 10px 15px hsl(0 0% 0% / 0.1), 0 4px 6px hsl(0 0% 0% / 0.05)',
        'elevation-4': '0 20px 25px hsl(0 0% 0% / 0.15), 0 8px 10px hsl(0 0% 0% / 0.06)',
      },
      width: {
        'touch-target': '44px',
        'touch-target-comfortable': '48px',
        'touch-target-spacious': '56px',
      },
      height: {
        'touch-target': '44px',
        'touch-target-comfortable': '48px',
        'touch-target-spacious': '56px',
      },
      minWidth: {
        'touch-target': '44px',
      },
      minHeight: {
        'touch-target': '44px',
      },
      backgroundImage: {
        'sunny-day': "url('https://images.unsplash.com/photo-1601297183305-6df142704ea2?q=80&w=1974&auto=format&fit=crop')",
        'cloudy-day': "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1951&auto=format&fit=crop')",
        'rainy-day': "url('https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1935&auto=format&fit=crop')",
        'snowy-day': "url('https://images.unsplash.com/photo-1491002052546-bf38f186af56?q=80&w=2008&auto=format&fit=crop')",
        'night-clear': "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop')",
        'night-cloudy': "url('https://images.unsplash.com/photo-1532978379173-0e44f6d7fe95?q=80&w=2070&auto=format&fit=crop')",
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        // Keep only non-page-transition keyframes
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [tailwindcssAnimate, scrollbar],
};

export default config;
