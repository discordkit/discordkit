import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      dev: { command: "next dev", cache: false },
      "build:examples": { command: "next build", cache: true },
      start: { command: "next start", cache: false }
    }
  }
});
