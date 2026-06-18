import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
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

        // Brand colors (Extracted from JivniCare logo)
        brand: {
          blue: "#5B9BD5",
          "blue-hover": "#4B8BC5",
          "blue-active": "#3B7BB5",
          green: "#4E9B5A",
          "green-hover": "#3E8B4A",
          "green-active": "#2E7B3A",
          navy: "#1B3F6B",
        },
        // Status colors
        status: {
          success: "#4E9B5A",
          error: "#DC2626",
          warning: "#F59E0B",
          info: "#5B9BD5",
        },
        // Background surfaces
        surface: {
          primary: "#F8F9FA",
          card: "#FFFFFF",
          secondary: "#F1F5F9",
        },
        // Text content colors
        content: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
        },
        // Disabled states
        disabled: {
          bg: "#E5E7EB",
          text: "#9CA3AF",
          border: "#D1D5DB",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        hindi: ["var(--font-hindi)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "16px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12)",
        glass: "0 8px 32px rgba(31,38,135,0.08)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
