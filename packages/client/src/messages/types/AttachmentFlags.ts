/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
import * as v from "valibot";
import { bitfield } from "@discordkit/core";

export enum AttachmentFlags {
  /** this attachment has been edited using the remix feature on mobile */
  IS_REMIX = 1 << 2
}

export const attachmentFlagsSchema = v.enum_(AttachmentFlags);
export const attachmentFlag = bitfield(
  `attachmentFlag`,
  AttachmentFlags,
  `Invalid Attachment Flag`
);
