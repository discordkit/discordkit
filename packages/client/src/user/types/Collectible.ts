import * as v from "valibot";
import { nameplateSchema } from "./Nameplate.js";

export const collectibleSchema = v.object({
  /** object mapping of nameplate data */
  nameplate: v.exactOptional(nameplateSchema)
});

export interface Collectible extends v.InferOutput<typeof collectibleSchema> {}
