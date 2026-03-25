import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', ...defaultTheme.fontFamily.sans],
                sporty: ['Bebas Neue', 'sans-serif'],
                handwriting: ['Montserrat', 'sans-serif'], // Or a real handwritten font if available via Google Fonts
            },
            colors: {
                primary: '#2EA8FF',
                accent: '#FFD400',
                dark: {
                    DEFAULT: '#0D0D0D',
                    soft: '#1A1A1A',
                    card: '#121212',
                },
                secondary: '#A0A0A0',
                border: 'rgba(255, 255, 255, 0.05)',
            },
            boxShadow: {
                'glow-blue': '0 0 20px rgba(46, 168, 255, 0.3)',
                'glow-yellow': '0 0 20px rgba(255, 212, 0, 0.3)',
            },
        },
    },

    plugins: [forms],
};
