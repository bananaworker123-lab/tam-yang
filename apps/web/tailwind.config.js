/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: '#5B53E0', soft: '#ECEBFD', ink: '#463FBF' },
        bg: '#F4F4FB',
        ink: '#1B1A2A',
        muted: '#6E6D80',
        faint: '#9B99AD',
        line: '#ECEAF3',
        status: {
          submitted: '#27A56B',
          done: '#EBA53A',
          notstarted: '#C9C7D8',
          overdue: '#E5484D',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
