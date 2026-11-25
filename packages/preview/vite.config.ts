import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defineConfig } from "vite-plus";
import { configDefaults } from "vite-plus/test/config";
import { buildTarget } from "../../scripts/buildTarget.js";

/** The package's one stylesheet, relative to `dist/`. Exported as `@discordkit/preview/react/styles.css`. */
const stylesheet = `styles.css`;

export default defineConfig({
  run: {
    tasks: {
      // The library first, because `vp pack` empties dist/; then Studio's static site into dist/studio (see vite.studio.config.ts).
      build: {
        command: `vp pack && vp build --config vite.studio.config.ts`,
        cache: true
      },
      dev: { command: `vp pack --watch`, cache: false }
    }
  },
  test: {
    globals: true,
    // `*.browser.spec.tsx` files run in the root config's `browser` project. Vitest reads this file, not the root one, when it is started from inside the package, so keep them out of the Node run here too.
    exclude: [...configDefaults.exclude, `**/*.browser.spec.{ts,tsx}`]
  },
  pack: {
    // Build target derived from the root package.json `engines.node` — a
    // single source of truth for the whole workspace.
    target: buildTarget,
    // Same 1:1 src-to-dist mirror as the other packages, widened to `.tsx` for the React components. Studio's web app is not part of the library: `vite.studio.config.ts` bundles it into dist/studio, and its server side lives in src/bridge, which is.
    entry: [
      `src/**/*.{ts,tsx}`,
      `!src/studio/**`,
      `!src/**/__tests__/**`,
      `!src/**/*.spec.{ts,tsx}`
    ],
    unbundle: true,
    dts: true,
    // Each `.module.css` compiles to a scoped stylesheet beside its chunk (`dist/react/Container.css`), and the JS keeps only the class-name map, with no `import` of the CSS. That keeps the React subpath importable from plain Node for server rendering, which a CSS import would break. The cost is that the CSS has to be loaded by hand, so `build:done` below joins it into the one `dist/styles.css` that the Node renderer reads and that bundler users import.
    //
    // `splitting: false` would emit one file directly, but under `unbundle` it concatenates chunks in the order their renders finish, so the file's rule order changes from build to build.
    hooks: {
      "build:done": async ({ options }) => {
        const sheets = (await readdir(options.outDir, { recursive: true }))
          .filter((file) => file.endsWith(`.css`) && file !== stylesheet)
          .sort();
        const css = await Promise.all(
          sheets.map(async (sheet) =>
            readFile(join(options.outDir, sheet), `utf8`)
          )
        );
        await writeFile(join(options.outDir, stylesheet), css.join(``));
        await Promise.all(
          sheets.map(async (sheet) => rm(join(options.outDir, sheet)))
        );
      }
    },
    deps: {
      // tsdown <0.23 compatibility: resolve external dependency subpaths.
      // Remove to preserve subpath imports as written (the new default).
      // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
      resolveDepSubpath: true,
      neverBundle: true
    }
  }
});
