# Apps release pipeline (follow-up)

> Status: **planned** — deferred from the `feat/social-sdk-native-bridge` PR to its own focused PR, because portable packaging + bundled-SDK runtime resolution can only be validated by actually building and running the per-OS CI matrix (it can't be dry-run on a single dev machine), and we didn't want unverifiable release artifacts in the stable-libraries PR.

## Goal

Publish **portable** (no-installer) builds of the example apps — `examples/with-electron` and `examples/with-tauri` — to the repo's GitHub **Releases**, with the Discord Social SDK binary **bundled into the app** (license-permitted: the Terms allow distributing the binary "as integrated into your Application"). Mirrors [`Saeris/plex-monitor`][plex]'s release shape, adapted for desktop GUI apps.

CI shape (`apps` workflow): an **OS matrix** (single Node LTS per runner, not a Node-version matrix), publishing via bumpy. Targets to mirror plex-monitor:

| Runner           | Targets                      |
| ---------------- | ---------------------------- |
| `ubuntu-latest`  | `linux-x64`, `linux-arm64`   |
| `macos-latest`   | `darwin-x64`, `darwin-arm64` |
| `windows-latest` | `win-x64`                    |

## The three pieces (in dependency order)

### 1. Bundled-SDK runtime resolution (`@discordkit/native`)

Today both apps load the SDK via `DISCORD_SDK_PATH` at **dev** time. A shipped portable app must find the SDK **inside its own bundle**. Extend `resolveLibraryPath`'s convention roots to probe the per-framework resource location:

- **Tauri**: the sidecar runs beside the app; the SDK should sit in the Tauri **resource dir**. The sidecar already sets `process.resourcesPath` for koffi (see `examples/with-tauri/scripts/build-sidecar.mjs`) — point the SDK there too, or pass `DISCORD_SDK_PATH` from the Tauri side via the shell-plugin env.
- **Electron**: the SDK ships under `process.resourcesPath` (electron-builder `extraResources`); add that to the resolver's convention roots.

`resolveLibrary.ts` already accepts a root and derives the per-platform file, so this is about adding the right roots, not new resolution logic. Add unit coverage for the new roots (mock `process.resourcesPath`).

### 2. Per-app portable packaging

**Tauri has no first-class "portable" target** — its bundler emits installers (`msi`/`nsis`/`dmg`/`deb`/`rpm`) + `appimage` + the raw `.app`. Assemble portable per-OS:

- **Linux → AppImage** (canonically portable; set `bundle.targets: ["appimage"]`).
- **macOS → zip the `.app`** (`bundle.targets: ["app"]`, then zip).
- **Windows → zip `target/release/<app>.exe` + its `resources/` + `binaries/` dirs** (no portable Windows target exists).
- Bundle the SDK: add the per-platform SDK lib to `tauri.conf.json` `bundle.resources` (koffi is already there). Source it from the private `discordkit/social-sdk` checkout in CI.
- Add a `tauri build` task (currently only `tauri dev` via `scripts/launch.mjs`); switch `bundle.targets` off `"all"`.

**Electron has no packaging today** — add **electron-builder** (portable target: Windows `portable` single-exe / mac+linux `dir` or zip) with the SDK as `extraResources`. New dep + `electron-builder.yml` (or `build` config) + a `package` task.

### 3. `apps` workflow + bumpy publish

Mirror plex-monitor's `release.yml` (`changes` → `pack` matrix → `publish` via `@varlock/bumpy ci plan`/`release` + `gh release upload`):

- `pack` job per OS: checkout discordkit + the private `discordkit/social-sdk` (token `SOCIAL_SDK_TOKEN`, already configured), build the app(s) with the SDK bundled, `upload-artifact` the portable bundles.
- `publish` job: `download-artifact` + `gh release upload "<tag>" <artifacts>` after bumpy cuts the release. Examples are `private: true` today — decide whether they get their own release tags or ride the workspace release.
- Needs `BUMPY_GH_TOKEN` secret (plex-monitor uses it) + `permissions: contents: write, id-token: write`.

## Why it's a follow-up, not part of the libraries PR

- **Unverifiable locally**: correct packaging + bundled-SDK resolution can only be confirmed by building _and running_ the artifact on each OS — i.e. on the CI matrix itself. Expect several red iterations per OS while tuning; that churn doesn't belong in the stable-libraries PR.
- **Net-new infra**: Electron packaging from scratch (new tool + dep), Tauri target rework, and resolver changes — each independently reviewable.
- The libraries + the `native` ABI job are complete and reviewable without it.

[plex]: https://github.com/Saeris/plex-monitor/blob/main/.github/workflows/release.yml
