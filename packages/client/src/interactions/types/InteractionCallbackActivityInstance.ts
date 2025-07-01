import * as v from "valibot";

export const interactionCallbackActivityInstanceSchema = v.object({
  /** 	Instance ID of the Activity if one was launched or joined. */
  id: v.pipe(v.string(), v.nonEmpty())
});

export interface InteractionCallbackActivityInstance
  extends v.InferOutput<typeof interactionCallbackActivityInstanceSchema> {}
