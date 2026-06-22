/**
 * `@discordkit/tauri` — run the Discord Social SDK in a Node **sidecar** process
 * and reach it from a Tauri webview over a typed kkrpc bridge.
 *
 * The bridge is **composed per-domain**, mirroring `@discordkit/native`'s subpaths
 * (and the `@discordkit/electron` adapter), so an app bundles only the native code
 * for the features it wires (importing presence does not pull in voice). The SDK
 * runs in a sidecar because its FFI is a Node runtime binding; Tauri's Rust plugin
 * (`tauri-plugin-discordkit`) spawns + supervises it and pumps stdio. Import the
 * piece for each context + each domain you use:
 *
 * - `@discordkit/tauri/sidecar`            — `createSidecar` (core host)
 * - `@discordkit/tauri/sidecar/<domain>`   — `registerUsers`, `registerLobbies`, …
 * - `@discordkit/tauri/client`             — `createClient` (webview, core)
 * - `@discordkit/tauri/client/<domain>`    — `usersSlice`, `lobbiesSlice`, …
 * - `@discordkit/tauri/renderer`           — `CoreBridge` / `FullBridge` typing
 * - `@discordkit/tauri/renderer/<domain>`  — per-domain bridge typing
 * - `@discordkit/tauri/signals`            — framework-agnostic reactive utilities
 *
 * See `docs/tauri-sidecar-plugin-architecture.md` for the architecture + the
 * three-surface (npm / Rust crate / sidecar binary) tree-shaking story.
 *
 * The root entry re-exports only the shared CORE contract (channel names + core
 * types), useful if you wire the bridge yourself.
 */

export { CORE_CHANNELS } from "./channels/core.js";
export type {
  CoreBridge,
  ConnectMessage,
  ActivityMessage
} from "./channels/core.js";
