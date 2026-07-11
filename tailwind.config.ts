import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
     ink: "#12202E",       // primary navy (text/accents only now)
     paper: "#FFFFFF",     // pure white background
     mist: "#F7F8F9",      // very light gray for subtle section breaks
     amber: "#C77A3B",     // retinoscope amber accent
     teal: "#3C6E63",      // lens-coating teal accent
     slate: "#5C6B78",     // muted text
     line: "#E4E8EB",      // lighter hairline borders
   },
      fontFamily: {
        sans: ["'General Sans'", "Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
