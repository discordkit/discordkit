import * as v from "valibot";
import { boundedString } from "@discordkit/core";

export const interactionCallbackActivityInstanceSchema = v.object({
  /** 	Instance ID of the Activity if one was launched or joined. */
  id: boundedString()
});

export interface InteractionCallbackActivityInstance
  extends v.InferOutput<typeof interactionCallbackActivityInstanceSchema> {}
