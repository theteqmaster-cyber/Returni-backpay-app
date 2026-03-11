import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        returni: {
          green: "#2E7D32", // primary action green
          darkGreen: "#1B5E20",
          lightGreen: "#E8F5E9",
          blue: "#1565C0", // secondary accent
          dark: "#1A1A2E", // keeping dark text
          bg: "#FAFAFA",   // overall white/off-white bg
        },
      },
    },
  },
  plugins: [],
};
export default config;
