import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        availability: {
          available: "#22c55e",
          few: "#eab308",
          full: "#ef4444",
          closed: "#9ca3af"
        }
      }
    }
  },
  plugins: []
};

export default config;
