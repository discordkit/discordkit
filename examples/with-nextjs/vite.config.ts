import { defineConfig } from "vite-plus";
import { mergeLint, lint, react, next, fmt } from "@saeris/configs";

export default defineConfig({
  run: {
    tasks: {
      dev: { command: `next dev`, cache: false },
      "build:examples": { command: `next build`, cache: true },
      start: { command: `next start`, cache: false }
    }
  },
  lint: mergeLint(lint, react, next),
  fmt
});
