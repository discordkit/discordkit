import { z } from "zod";
import { ComponentType } from "./ComponentType.js";
import { buttonSchema } from "./Button.js";
import { selectMenuSchema } from "./SelectMenu.js";
import { textInputSchema } from "./TextInput.js";

export const actionRowSchema = z.object({
  type: z.literal(ComponentType.ActionRow),
  components: z.union([buttonSchema, selectMenuSchema, textInputSchema]).array()
});

export type ActionRow = z.infer<typeof actionRowSchema>;
