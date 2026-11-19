/* oxlint-disable @typescript-eslint/prefer-literal-enum-member */
import * as v from "valibot";
import { bitfield } from "@discordkit/core/validations/bitfield";

/**
 * ### [Attachment Flags](https://discord.com/developers/docs/resources/message#attachment-object-attachment-flags)
 *
 * > [!WARNING]
 * >
 * > Content scanning can run after the message is sent, so the `CONTAINS_*` flags may not be present on the initial message and can be added later in a Message Update event.
 * >
 * > If your app reposts media from users, check the flags on the message you send and in any later Message Update event, and take action, like deleting the message, if the media was flagged.
 * >
 * > Attachments in an interaction's resolved data, such as uploads from a File Upload component or an `attachment` command option, don't include these flags. They're only set once the media is sent in a message.
 */
export enum AttachmentFlags {
  /** this attachment is a [Clip from a stream](https://support.discord.com/hc/en-us/articles/16861982215703) */
  IS_CLIP = 1 << 0,
  /** this attachment is the thumbnail of a thread in a media channel, displayed in the grid but not on the message */
  IS_THUMBNAIL = 1 << 1,
  /** @deprecated this attachment has been edited using the remix feature on mobile */
  IS_REMIX = 1 << 2,
  /** this attachment was marked as a spoiler and is blurred until clicked */
  IS_SPOILER = 1 << 3,
  /** this attachment was flagged as explicit by Discord's content scanning */
  CONTAINS_EXPLICIT_CONTENT = 1 << 4,
  /** this attachment is an animated image */
  IS_ANIMATED = 1 << 5,
  /** this attachment was flagged as gore by Discord's content scanning */
  CONTAINS_GORE_CONTENT = 1 << 6,
  /** this attachment was flagged as self-harm by Discord's content scanning */
  CONTAINS_SELF_HARM_CONTENT = 1 << 7
}

export const attachmentFlagsSchema = v.enum_(AttachmentFlags);
export const attachmentFlag = bitfield(
  `attachmentFlag`,
  AttachmentFlags,
  `Invalid Attachment Flag`
);
