import { object, literal, union, array, type Output } from "valibot";
import { ComponentType } from "./ComponentType.js";
import { buttonSchema } from "./Button.js";
import { selectMenuSchema } from "./SelectMenu.js";
import { textInputSchema } from "./TextInput.js";

export const actionRowSchema = object({
  type: literal(ComponentType.ActionRow),
  components: array(union([buttonSchema, selectMenuSchema, textInputSchema]))
});

export type ActionRow = Output<typeof actionRowSchema>;
