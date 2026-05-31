import * as v from "valibot";
import { schema } from "@discordkit/core";
import { nameplateSchema } from "./Nameplate.js";

const _collectibleSchema = v.object({
  /** object mapping of nameplate data */
  nameplate: v.exactOptional(nameplateSchema)
});

export interface Collectible extends v.InferOutput<typeof _collectibleSchema> {}

/**
 * ### [Collectible](https://discord.com/developers/docs/resources/user#collectibles)
 *
 * The collectibles the user has, excluding Avatar Decorations and Profile Effects.
 */
export const collectibleSchema = schema<Collectible>(_collectibleSchema);
