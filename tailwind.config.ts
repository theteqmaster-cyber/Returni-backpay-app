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
          orange: "#E85D04",
          dark: "#1A1A2E",
          cream: "#F5F0E8",
        },
      },
    },
  },
  plugins: [],
};
export default config;
