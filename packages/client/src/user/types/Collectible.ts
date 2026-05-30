import * as v from "valibot";
import { nameplateSchema } from "./Nameplate.js";

/**
 * ### [Collectible](https://discord.com/developers/docs/resources/user#collectibles)
 *
 * The collectibles the user has, excluding Avatar Decorations and Profile Effects.
 */
export const collectibleSchema = v.object({
  /** object mapping of nameplate data */
  nameplate: v.exactOptional(nameplateSchema)
});

export interface Collectible extends v.InferOutput<typeof collectibleSchema> {}
