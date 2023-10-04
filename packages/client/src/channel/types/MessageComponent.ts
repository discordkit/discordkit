import type { z } from "zod";
import { actionRowSchema } from "./ActionRow.js";

export const messageComponentSchema = actionRowSchema.array().max(5);

export type MessageComponent = z.infer<typeof messageComponentSchema>;
