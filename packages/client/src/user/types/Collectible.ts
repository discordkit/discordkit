import * as v from "valibot";
import { nameplateSchema } from "./Nameplate.js";

export const collectableSchema = v.object({
  /** object mapping of nameplate data */
  nameplate: v.exactOptional(nameplateSchema)
});

export interface Collectable extends v.InferOutput<typeof collectableSchema> {}
