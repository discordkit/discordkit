import type * as v from "valibot";
import { boundedArray } from "@discordkit/core";
import { actionRowSchema } from "../../components/types/ActionRow.js";

export const messageComponentSchema = boundedArray(actionRowSchema, { max: 5 });

export interface MessageComponent
  extends v.InferOutput<typeof messageComponentSchema> {}
