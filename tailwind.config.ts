import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#0d0d0d",
        foreground: "#F0F0F0",
        "foreground-muted": "#A0A0A0",
        primary: {
          DEFAULT: "#00FFC6",
          foreground: "#0d0d0d",
        },
        secondary: {
          DEFAULT: "#FF6B81",
          foreground: "#0d0d0d",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#A0A0A0",
          foreground: "#F0F0F0",
        },
        accent: {
          DEFAULT: "#00FFC6",
          foreground: "#0d0d0d",
        },
        popover: {
          DEFAULT: "#0d0d0d",
          foreground: "#F0F0F0",
        },
        card: {
          DEFAULT: "#0d0d0d",
          foreground: "#F0F0F0",
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        spotlight: "spotlight 5s infinite",
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
