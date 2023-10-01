/* eslint-disable @typescript-eslint/prefer-literal-enum-member */

import { z } from "zod";

/* eslint-disable no-bitwise */
export enum AttachmentFlags {
  /** this attachment has been edited using the remix feature on mobile */
  IS_REMIX = 1 << 2
}

export const attachmentFlagsSchema = z.nativeEnum(AttachmentFlags);
