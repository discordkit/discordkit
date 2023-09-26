import { z } from "zod";
import { ComponentType } from "./ComponentType";
import { buttonSchema } from "./Button";
import { selectMenuSchema } from "./SelectMenu";
import { textInputSchema } from "./TextInput";

export const actionRowSchema = z.object({
  type: z.literal(ComponentType.ActionRow),
  components: z.union([buttonSchema, selectMenuSchema, textInputSchema]).array()
});

export type ActionRow = z.infer<typeof actionRowSchema>;
