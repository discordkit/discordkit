import type { Config } from "tailwindcss";

export default {
  content: [
    `./src/components/**/*.{js,ts,jsx,tsx,mdx}`,
    `./src/app/**/*.{js,ts,jsx,tsx,mdx}`
  ],
  plugins: []
} satisfies Config;
