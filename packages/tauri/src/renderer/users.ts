/** Webview typing for the users namespace. See `@discordkit/tauri/renderer`. */
export type { UsersBridge } from "../channels/users.js";

/**
 * The webview-facing `User` — identical to native's `User`. Snowflake ids are
 * strings throughout `@discordkit/native` (Discord's wire convention), so they
 * cross the bridge unchanged; no adapter-side rewriting is needed.
 */
export type { User } from "@discordkit/native/users";
