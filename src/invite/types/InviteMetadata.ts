import { z } from "zod";
import { inviteSchema } from "./Invite";

export const inviteMetadataSchema = inviteSchema.extend({
  /** number of times this invite has been used */
  uses: z.number().int().positive(),
  /** max number of times this invite can be used */
  maxUses: z.number().int().positive(),
  /** duration (in seconds) after which the invite expires */
  maxAge: z.number().int().positive(),
  /** whether this invite only grants temporary membership */
  temporary: z.boolean(),
  /** when this invite was created */
  createdAt: z.string()
});

export type InviteMetadata = z.infer<typeof inviteMetadataSchema>;
