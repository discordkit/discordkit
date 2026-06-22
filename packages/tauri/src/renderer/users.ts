/** Webview typing for the users namespace. See `@discordkit/tauri/renderer`. */
import type { User as NativeUser } from "@discordkit/native/users";
import type { Wire } from "../wire.js";

export type { UsersBridge } from "../channels/users.js";

/**
 * The webview-facing `User`: native's `User` with snowflake ids as strings (the
 * form they cross the bridge in — Discord's wire convention). Use this for typing
 * values you read off the `users` bridge.
 */
export type User = Wire<NativeUser>;
