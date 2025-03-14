/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
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