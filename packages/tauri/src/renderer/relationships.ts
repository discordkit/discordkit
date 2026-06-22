/** Webview typing for the relationships namespace. */
export type { RelationshipsBridge } from "../channels/relationships.js";

/**
 * The webview-facing `Relationship` — identical to native's `Relationship`.
 * Snowflake ids are strings throughout `@discordkit/native` (Discord's wire
 * convention), so they cross the bridge unchanged; no adapter-side rewriting.
 */
export type { Relationship } from "@discordkit/native/relationships";
