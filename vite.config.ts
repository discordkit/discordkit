import { defineConfig } from "vite-plus";
import { lint, next, fmt, mergeLint } from "@saeris/configs";

export default defineConfig({
  run: {
    tasks: {
      build: { command: `vp run -r build`, cache: true },
      "build:apps": { command: `vp run -r build:apps`, cache: true },
      "build:examples": { command: `vp run -r build:examples`, cache: true },
      "build:all": {
        command: `vp run build && vp run build:apps && vp run build:examples`,
        cache: true
      },
      lint: { command: `vp lint`, cache: true },
      dev: { command: `vp run -r --parallel dev`, cache: false },
      ci: { command: `vp lint && vp test && vp run build:all`, cache: false }
    }
  },
  // Resolve workspace packages to their TypeScript source via the private
  // `@discordkit/source` export condition (matches tsconfig `customConditions`)
  // so Vitest runs against `src/` without requiring a build. The name is
  // private — not `development` — so external bundlers (Next.js) don't pick it
  // up and try to resolve our `.js`-on-`.ts` source imports, which they can't.
  resolve: {
    conditions: [`@discordkit/source`]
  },
  test: {
    name: `discordkit`,
    globals: true,
    watch: false,
    // Node is ~2x faster than happy-dom for this suite (13s vs 26s wall-clock).
    // No test in this codebase touches DOM APIs that Node 18+ doesn't already
    // provide globally (Response, URL, Blob, File, FormData, crypto.subtle).
    // verifyKey.ts feature-detects `typeof window` so it works in both
    // environments. If a future test needs a real DOM, opt in per-file with:
    //   // @vitest-environment happy-dom
    environment: `node`,
    coverage: {
      provider: `v8`
    },
    // Exclude Claude Code agent worktrees from test discovery. Each agent
    // run materializes a full git worktree under `.claude/worktrees/`,
    // including its own copy of every spec file. Without this exclusion,
    // Wallaby/vitest pick up the duplicated specs and report them as
    // failing/passing alongside the canonical ones.
    exclude: [
      `**/node_modules/**`,
      `**/dist/**`,
      `**/.{idea,git,cache,output,temp}/**`,
      `**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*`,
      `**/.claude/**`
    ]
  },
  lint: mergeLint(lint, next, {
    rules: {
      // False-positive on type-only namespace members like `v.InferOutput`.
      // The rule reads the runtime JS bundle rather than the .d.ts, so
      // pure-type re-exports are reported as missing. TypeScript already
      // catches truly-missing members. Tracked at oxc-project/oxc#13258.
      "import/namespace": `off`
    },
    overrides: [
      {
        // `.test-d.ts` files use vitest's `assertType<T>` + `@ts-expect-error`
        // for compile-time assertions; they don't use runtime `expect()`.
        // The shared `vitest` preset's `expect-expect` rule allows
        // `["expect", "expect*"]` only, so these files trip the rule even
        // though they contain the right kind of assertions.
        files: [`**/*.test-d.{ts,tsx}`],
        rules: {
          "vitest/expect-expect": `off`
        }
      },
      {
        // `scripts/` holds one-off codemods and doc-tooling — not shipped
        // library surface. Defensive optional chains, type-coerce casts,
        // and structural narrowing patterns are appropriate here even when
        // tsc can prove them locally redundant.
        files: [`scripts/**/*.{js,jsx,ts,tsx}`],
        rules: {
          "typescript/no-unsafe-type-assertion": `off`,
          "typescript/no-unnecessary-condition": `off`
        }
      },
      {
        // Schema-definition and request-helper files use `as v.GenericSchema<T>`
        // (and `as v.ObjectSchema<...>` / `as v.RecordSchema<...>`) casts to
        // constrain the function return type to the published shape. Casts ARE
        // redundant at the type-checker level — that's exactly what we want,
        // because forcing the published type to GenericSchema<T> stops
        // downstream .d.ts files from re-inlining the full entries map at
        // every reference. Removing them works at the type level but bloats
        // the .d.ts in practice. The rules have no way to know about emit-
        // shape concerns. Both `no-unsafe-type-assertion` and
        // `no-unnecessary-type-assertion` flag these; the autofixer for the
        // latter silently strips them, breaking the published types. We
        // disable both project-wide in `packages/{core,client}/src` since
        // those directories are entirely schema-defining surface — a real
        // unsafe-cast there would be type-checked anyway.
        files: [`packages/core/src/**/*.ts`, `packages/client/src/**/*.ts`],
        rules: {
          "typescript/no-unsafe-type-assertion": `off`,
          "typescript/no-unnecessary-type-assertion": `off`
        }
      }
    ]
  }),
  fmt
});
