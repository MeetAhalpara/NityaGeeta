import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          bg: "var(--card-bg)",
          border: "var(--card-border)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        gold: {
          primary: "var(--gold-primary)",
          hover: "var(--gold-hover)",
          light: "var(--gold-light)",
        },
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          DEFAULT: 'var(--saffron)',
          hover: 'var(--saffron-hover)',
        },
        orange: {
          accent: 'var(--orange-accent)',
        },
        input: {
          bg: "var(--input-bg)",
          border: "var(--input-border)",
          focus: "var(--input-focus)",
        },
        google: {
          btn: {
            bg: "var(--google-btn-bg)",
            border: "var(--google-btn-border)",
            hover: "var(--google-btn-hover)",
          },
        },
        navbar: {
          bg: "var(--navbar-bg)",
          border: "var(--navbar-border)",
        },
        divider: "var(--divider)",
        glass: {
          bg: "var(--glass)",
          border: "var(--glass-border)",
        },
        error: {
          bg: "var(--error-bg)",
          border: "var(--error-border)",
          text: "var(--error-text)",
        },
        success: {
          text: "var(--success-text)",
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, var(--gold-primary) 0%, var(--orange-accent) 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
