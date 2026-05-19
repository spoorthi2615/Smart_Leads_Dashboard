module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F46E5',
          dark: '#6366F1',
        },
        bg: {
          light: '#F8FAFC',
          dark: '#0B0F19',
        },
        surface: '#FFFFFF',
        'surface-strong': '#F8FAFC',
        'surface-highlight': '#EEF2FF',
        border: '#E2E8F0',
        'border-dark': '#334155',
        'text-heading': '#0F172A',
        'text-body': '#475569',
        'text-heading-dark': '#F8FAFC',
        'text-body-dark': '#94A3B8',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
