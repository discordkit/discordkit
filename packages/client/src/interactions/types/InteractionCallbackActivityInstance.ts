import type { InferOutput } from "valibot";
import { nonEmpty, object, pipe, string } from "valibot";

export const interactionCallbackActivityInstanceSchema = object({
  /** 	Instance ID of the Activity if one was launched or joined. */
  id: pipe(string(), nonEmpty())
});

export interface InteractionCallbackActivityInstance
  extends InferOutput<typeof interactionCallbackActivityInstanceSchema> {}
