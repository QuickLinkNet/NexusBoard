/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0066FF',
                    dark: '#0052CC'
                },
                sidebar: {
                    DEFAULT: '#1E1E1E',
                    hover: '#2D2D2D'
                }
            },
            spacing: {
                'sidebar': '72px',
                'header': '64px'
            },
            keyframes: {
                "fade-in": {
                    "0%": {opacity: 0},
                    "100%": {opacity: 1}
                },
                "fade-out": {
                    "0%": {opacity: 1},
                    "100%": {opacity: 0}
                },
                "slide-in-from-right": {
                    "0%": {transform: "translateX(100%)"},
                    "100%": {transform: "translateX(0)"}
                },
                "slide-out-to-right": {
                    "0%": {transform: "translateX(0)"},
                    "100%": {transform: "translateX(100%)"}
                }
            },
            animation: {
                "fade-in": "fade-in 0.3s ease-in",
                "fade-out": "fade-out 0.3s ease-out",
                "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
                "slide-out-to-right": "slide-out-to-right 0.3s ease-in"
            }
        },
    },
    plugins: [require("tailwindcss-animate")],
};