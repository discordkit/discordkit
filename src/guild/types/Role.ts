import { z } from "zod";
import { roleTag } from "./RoleTag";

export const role = z.object({
  /** role id */
  id: z.string().min(1),
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
  tags: z.array(roleTag).optional()
});

export type Role = z.infer<typeof role>;
