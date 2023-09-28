import { z } from "zod";
import { ComponentType } from "./ComponentType.ts";
import { buttonSchema } from "./Button.ts";
import { selectMenuSchema } from "./SelectMenu.ts";
import { textInputSchema } from "./TextInput.ts";

export const actionRowSchema = z.object({
  type: z.literal(ComponentType.ActionRow),
  components: z.union([buttonSchema, selectMenuSchema, textInputSchema]).array()
});

export type ActionRow = z.infer<typeof actionRowSchema>;
