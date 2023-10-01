import { snowflake } from "@discordkit/core";
import { z } from "zod";

// https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure
export const overwriteSchema = z.object({
  /** role or user id */
  id: snowflake,
  /** either 0 (role) or 1 (member) */
  type: z.union([z.literal(0), z.literal(1)]),
  /** permission bit set */
  allow: z.string().min(1),
  /** permission bit set */
  deny: z.string().min(1)
});

export type Overwrite = z.infer<typeof overwriteSchema>;
