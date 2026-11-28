import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

/**
 * Studio, the package's second build output: a static site in `dist/studio` that `discordkit-preview studio` serves. `vp pack` builds the library beside it from `vite.config.ts` and leaves `src/studio` out.
 *
 * Everything Studio runs in the browser (React, react-aria-components, react-hook-form, the preview itself) is bundled here, which is why those are dev dependencies: someone importing only the library subpaths never installs them.
 */
export default defineConfig({
  root: fileURLToPath(new URL(`src/studio`, import.meta.url)),
  // Relative asset URLs: the bridge serves the site under a secret path prefix, and a copy can be opened from any other host.
  base: `./`,
  build: {
    outDir: fileURLToPath(new URL(`dist/studio`, import.meta.url)),
    emptyOutDir: true,
    target: `es2022`,
    // No source maps in the published package; the source is in the repository.
    sourcemap: false,
    // One chunk is right for an app served from the loopback interface: about 660 kB (200 kB gzipped), most of it React, react-aria-components and the client's schemas that lint validates with.
    chunkSizeWarningLimit: 1024
  }
});
