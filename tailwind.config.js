/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fadeIn": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "conversion-success-circle": {
          "0%": { 
            strokeDashoffset: "140", 
            opacity: "0.2"
          },
          "40%": { 
            strokeDashoffset: "140", 
            opacity: "0.5"
          },
          "80%": { 
            strokeDashoffset: "0", 
            opacity: "0.8"
          },
          "100%": { 
            strokeDashoffset: "0", 
            opacity: "0"
          }
        },
        "conversion-success-check": {
          "0%": { 
            strokeDashoffset: "30", 
            opacity: "0.2"
          },
          "40%": { 
            strokeDashoffset: "30", 
            opacity: "0.5"
          },
          "70%": { 
            strokeDashoffset: "0", 
            opacity: "1"
          },
          "90%": { 
            strokeDashoffset: "0", 
            opacity: "0.8"
          },
          "100%": { 
            strokeDashoffset: "0", 
            opacity: "0"
          }
        },
        "conversion-success-fade": {
          "0%": { opacity: "1", transform: "scale(0.8)" },
          "70%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(1.1)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fadeIn": "fadeIn 0.3s ease-out",
        "conversion-success": "conversion-success-fade 1s ease-out forwards",
        "conversion-circle": "conversion-success-circle 1s ease-out forwards",
        "conversion-check": "conversion-success-check 1s ease-out forwards 0.2s"
      },
    },
  },
  plugins: [],
} 