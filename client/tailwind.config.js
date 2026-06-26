/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10131f',
        aurora: '#00d1b2',
        pulse: '#ff5c7a',
        gold: '#f4c95d'
      },
      boxShadow: {
        glass: '0 20px 80px rgba(16, 19, 31, 0.18)'
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at 15% 20%, rgba(0, 209, 178, 0.24), transparent 32%), radial-gradient(circle at 82% 12%, rgba(255, 92, 122, 0.2), transparent 28%), linear-gradient(135deg, #f8fbff 0%, #eef3f8 45%, #fff8ec 100%)',
        'mesh-dark': 'radial-gradient(circle at 15% 20%, rgba(0, 209, 178, 0.16), transparent 32%), radial-gradient(circle at 82% 12%, rgba(255, 92, 122, 0.14), transparent 28%), linear-gradient(135deg, #090b12 0%, #111827 48%, #16111d 100%)'
      }
    }
  },
  plugins: []
};
