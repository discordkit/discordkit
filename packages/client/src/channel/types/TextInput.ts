import { z } from "zod";
import { ComponentType } from "./ComponentType.ts";
import { textInputStyleSchema } from "./TextInputStyle.ts";

export const textInputSchema = z.object({
  /** 4 for a text input */
  type: z.literal(ComponentType.TextInput),
  /** Developer-defined identifier for the input; max 100 characters */
  customId: z.string().max(100),
  /** The Text Input Style */
  style: textInputStyleSchema,
  /** Label for this component; max 45 characters */
  label: z.string().max(45),
  /** Minimum input length for a text input; min 0, max 4000 */
  minLength: z.number().int().min(0).max(4000).nullable(),
  /** Maximum input length for a text input; min 1, max 4000 */
  maxLength: z.number().int().min(1).max(4000).nullable(),
  /** Whether this component is required to be filled (defaults to true) */
  required: z.boolean().nullable().default(true),
  /** Pre-filled value for this component; max 4000 characters */
  value: z.string().min(1).max(4000).nullable(),
  /** Custom placeholder text if the input is empty; max 100 characters */
  placeholder: z.string().max(100).nullable()
});

export type TextInput = z.infer<typeof textInputSchema>;
