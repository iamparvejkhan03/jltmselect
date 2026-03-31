/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Background colors
        "primary": "#1A1A2E",
        "secondary": "#C9A84C",
        "bg-primary": "#1A1A2E", // Dark bg in light mode, Light bg in dark mode
        "bg-primary-light": "#313131", // Dark bg in light mode, Light bg in dark mode
        "bg-secondary": "#ffffff", // Light bg in light mode, Dark bg in dark mode
        "bg-secondary-dark": "#FAF8F5", // Light bg in light mode, Dark bg in dark mode

        // Text colors
        "text-primary": "#1A1A2E", // Primary text in light mode
        "text-secondary": "#313131", // Secondary text in light mode
        "text-primary-dark": "#FFFFFF", // Primary text in dark mode
        "text-secondary-dark": "#E5E5E5", // Secondary text in dark mode

        // Static colors (don't change with theme)
        "pure-white": "#FFFFFF",
        "pure-black": "#000000",
      },
      animation: {
        "spin-slow": "spin 1s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float-delayed 8s ease-in-out infinite 1s",
        pulse: "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-15px) rotate(-5deg)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
