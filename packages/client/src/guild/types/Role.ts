import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { roleTagSchema } from "./RoleTag.js";

export const roleSchema = z.object({
  /** role id */
  id: snowflake,
  /** role name */
  name: z.string().min(1),
  /** integer representation of hexadecimal color code */
  color: z.number(),
  /** if this role is pinned in the user listing */
  hoist: z.boolean(),
  /** role icon hash */
  icon: z.string().min(1).optional(),
  /** role unicode emoji */
  unicodeEmoji: z.string().min(1).optional(),
  /** position of this role */
  position: z.number(),
  /** permission bit set */
  permissions: z.string().min(1),
  /** whether this role is managed by an integration */
  managed: z.boolean(),
  /** whether this role is mentionable */
  mentionable: z.boolean(),
  /** the tags this role has */
  tags: roleTagSchema.array().optional()
});

export type Role = z.infer<typeof roleSchema>;
