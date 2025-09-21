/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          900: '#050316',
          800: '#0d0b25',
          700: '#1a1537'
        },
        accent: {
          primary: '#9c6cff',
          secondary: '#4fd1c5',
          amber: '#f6c76a'
        }
      },
      boxShadow: {
        card: '0 20px 45px -20px rgba(76, 29, 149, 0.6)'
      },
      backgroundImage: {
        'glow-grid': 'radial-gradient(circle at 20% 20%, rgba(79, 209, 197, 0.25), transparent 50%), radial-gradient(circle at 80% 0%, rgba(156, 108, 255, 0.2), transparent 55%)'
      }
    },
  },
  plugins: [],
};
