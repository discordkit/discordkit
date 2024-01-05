import { array, maxLength, type Output } from "valibot";
import { actionRowSchema } from "./ActionRow.js";

export const messageComponentSchema = array(actionRowSchema, [maxLength(5)]);

export type MessageComponent = Output<typeof messageComponentSchema>;
