import * as v from "valibot";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { componentTypeSchema } from "../../components/types/ComponentType.js";
import { resolvedDataSchema } from "./ResolvedData.js";

export const messageComponentData = v.object({
  /** custom_id of the component */
  customId: boundedString({ max: 100 }),
  /** type of the component */
  componentType: componentTypeSchema,
  /** Values the user selected in a select menu component: the `value` of each chosen option, or the ID of each chosen user, role or channel */
  values: v.exactOptional(v.array(v.string())),
  /** Resolved entities from selected options */
  resolved: v.exactOptional(resolvedDataSchema)
});

export interface MessageComponentData extends v.InferOutput<
  typeof messageComponentData
> {}
