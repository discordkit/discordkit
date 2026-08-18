// https://discord.com/developers/docs/resources/message#get-reactions-reaction-types

import * as v from "valibot";

/**
 * ### [Reaction Types](https://discord.com/developers/docs/resources/message#get-reactions-reaction-types)
 *
 * Distinguishes an ordinary reaction from a **burst** (super) reaction. The
 * reaction events carry this as a bare `integer`, so the enum exists to make
 * the call site readable — `type === ReactionType.BURST` rather than `=== 1`.
 */
export enum ReactionType {
  NORMAL = 0,
  BURST = 1
}

export const reactionTypeSchema = v.enum_(ReactionType);
