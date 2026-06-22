/** Webview typing for the relationships namespace. */
import type { Relationship as NativeRelationship } from "@discordkit/native/relationships";
import type { Wire } from "../wire.js";

export type { RelationshipsBridge } from "../channels/relationships.js";

/**
 * The webview-facing `Relationship`: native's `Relationship` with snowflake ids as
 * strings (the form they cross the bridge in — Discord's wire convention). Use
 * this for typing values you read off the `relationships` bridge.
 */
export type Relationship = Wire<NativeRelationship>;
