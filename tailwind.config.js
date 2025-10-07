/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'osu-pink': 'var(--osu-pink, #ED8EA6)',
        'profile-color': 'var(--profile-color, #ED8EA6)',
        'osu-blue': '#7DD5D4',
        'osu-purple': '#7DD5D4',
        'primary': 'var(--osu-pink, #ED8EA6)',
        'secondary': '#7DD5D4',
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border-color': 'var(--border-color)',
        'border-hover': 'var(--border-hover)',
        'card-bg': 'var(--card-bg)',
        'card-bg-hover': 'var(--card-bg-hover)',
        'btn-bg': 'var(--btn-bg)',
        'btn-bg-hover': 'var(--btn-bg-hover)',
        'float-panel-bg': 'var(--float-panel-bg)',
      },
      backgroundColor: {
        'card': 'var(--card-bg)',
        'card-hover': 'var(--card-bg-hover)',
        'float-panel': 'var(--float-panel-bg)',
        'navbar': 'var(--navbar-bg)',
      },
      borderColor: {
        'default': 'var(--border-color)',
        'hover': 'var(--border-hover)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
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
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
