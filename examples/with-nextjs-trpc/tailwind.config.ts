import type { Config } from "tailwindcss";

// oxlint-disable-next-line import-x/no-default-export
export default {
  content: [
    `./src/components/**/*.{js,ts,jsx,tsx,mdx}`,
    `./src/app/**/*.{js,ts,jsx,tsx,mdx}`
  ],
  plugins: []
} satisfies Config;
