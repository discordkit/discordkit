/* oxlint-disable @typescript-eslint/prefer-literal-enum-member */
import * as v from "valibot";
import { bitfield } from "@discordkit/core/validations/bitfield";

/**
 * ### [Embed Flags](https://discord.com/developers/docs/resources/message#embed-object-embed-flags)
 *
 * > [!WARNING]
 * >
 * > Content scanning can run after the message is sent, so the `CONTAINS_*` flags may not be present on the initial message and can be added later in a Message Update event.
 * >
 * > If your app reposts media from users, check the flags on the message you send and in any later Message Update event, and take action, like deleting the message, if the media was flagged.
 */
export enum EmbedFlags {
  /** this embed's media was flagged as explicit by Discord's content scanning */
  CONTAINS_EXPLICIT_CONTENT = 1 << 4,
  /** this embed is a fallback for a reply to an activity card */
  IS_CONTENT_INVENTORY_ENTRY = 1 << 5,
  /** this embed's media was flagged as gore by Discord's content scanning */
  CONTAINS_GORE_CONTENT = 1 << 6,
  /** this embed's media was flagged as self-harm by Discord's content scanning */
  CONTAINS_SELF_HARM_CONTENT = 1 << 7
}

export const embedFlagsSchema = v.enum_(EmbedFlags);
export const embedFlag = bitfield(
  `embedFlag`,
  EmbedFlags,
  `Invalid Embed Flag`
);
