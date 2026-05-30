import * as v from "valibot";

/**
 * ### [Connection Visibility](https://discord.com/developers/docs/resources/user#connection-object-visibility-types)
 */
export enum ConnectionVisibility {
  /** invisible to everyone except the user themselves */
  NONE = 0,
  /** visible to everyone */
  EVERYONE = 1
}

export const connectionVisibilitySchema = v.enum_(ConnectionVisibility);
