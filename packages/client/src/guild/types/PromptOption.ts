import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { emojiSchema } from "../../emoji/types/Emoji.js";

export const promptOptionSchema = v.object({
  /** ID of the prompt option */
  id: snowflake,
  /** IDs for channels a member is added to when the option is selected */
  channelIds: v.array(snowflake),
  /** IDs for roles assigned to a member when the option is selected */
  roleIds: v.array(snowflake),
  /** Emoji of the option */
  emoji: v.exactOptional(emojiSchema),
  /** Emoji ID of the option */
  emojiId: v.exactOptional(snowflake),
  /** Emoji name of the optio */
  emojiName: v.exactOptional(v.pipe(v.string(), v.nonEmpty())),
  /** Whether the emoji is animated */
  emojiAnimated: v.exactOptional(v.boolean()),
  /** Title of the option */
  title: v.pipe(v.string(), v.nonEmpty()),
  /** Description of the option */
  description: v.nullable(v.string())
});

export interface PromptOption
  extends v.InferOutput<typeof promptOptionSchema> {}
