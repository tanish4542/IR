/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#6b46ff',
          600: '#5a38f0'
        },
        accent: {
          400: '#4ade80'
        }
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(120deg, #0b1020, #111827)',
        'brand-gradient': 'linear-gradient(135deg, #6b46ff 0%, #4ade80 100%)'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.35)'
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};


