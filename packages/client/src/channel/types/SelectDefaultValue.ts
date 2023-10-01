import { z } from "zod";

export const selectDefaultValueSchema = z.object({
  /** ID of a user, role, or channel */
  id: z.string().min(1),
  /** Type of value that id represents. Either "user", "role", or "channel" */
  type: z.union([z.literal(`user`), z.literal(`role`), z.literal(`channel`)])
});

export type SelectDefaultValue = z.infer<typeof selectDefaultValueSchema>;
