import type { InferOutput } from "valibot";
import { exactOptional, object } from "valibot";
import { nameplateSchema } from "./Nameplate.js";

export const collectableSchema = object({
  /** object mapping of nameplate data */
  nameplate: exactOptional(nameplateSchema)
});

export interface Collectable extends InferOutput<typeof collectableSchema> {}
