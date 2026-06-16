/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        wine: {
          50: "#F7EDEE",
          100: "#EBD7D9",
          200: "#D4AFB3",
          300: "#BE878D",
          400: "#A75F67",
          500: "#904A52",
          600: "#722F37",
          700: "#5A252C",
          800: "#421A20",
          900: "#2A1014",
        },
        gold: {
          50: "#FBF5ED",
          100: "#F5E6D2",
          200: "#EBCEA5",
          300: "#E0B578",
          400: "#D4A574",
          500: "#C99560",
          600: "#B47E45",
          700: "#8A6035",
          800: "#604225",
          900: "#362415",
        },
        cream: {
          50: "#FDFBF7",
          100: "#FAF5EC",
          200: "#F5F0E8",
          300: "#EDE5D6",
          400: "#DFD3BC",
          500: "#D0C1A2",
          600: "#BBA67F",
          700: "#A58B5E",
          800: "#8A6F46",
          900: "#6E5736",
        },
        charcoal: {
          50: "#F2F2F5",
          100: "#E0E0E8",
          200: "#BFBFCC",
          300: "#9D9DB0",
          400: "#7C7C94",
          500: "#5B5B78",
          600: "#3D3D54",
          700: "#2D2D3F",
          800: "#1A1A2E",
          900: "#0E0E1A",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', "Georgia", "serif"],
        sans: ['"Inter"', '"PingFang SC"', '"Microsoft YaHei"', "sans-serif"],
      },
      boxShadow: {
        "theater": "0 4px 20px rgba(114, 47, 55, 0.15)",
        "theater-lg": "0 8px 40px rgba(114, 47, 55, 0.2)",
        "gold-glow": "0 0 20px rgba(212, 165, 116, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-in-up": "fadeInUp 0.4s ease-out",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212, 165, 116, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(212, 165, 116, 0)" },
        },
      },
    },
  },
  plugins: [],
};
