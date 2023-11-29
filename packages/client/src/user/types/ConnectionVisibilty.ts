import { enum_ } from "valibot";

export enum ConnectionVisibilty {
  /** invisible to everyone except the user themselves */
  NONE = 0,
  /** visible to everyone */
  EVERYONE = 1
}

export const connectionVisibiltySchema = enum_(ConnectionVisibilty);
