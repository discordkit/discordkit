import { snowflake } from "@discordkit/core";
import type { InferOutput } from "valibot";
import { nonEmpty, object, picklist, pipe, string, url } from "valibot";

/**
 * The nameplate the user has.
 */
export const nameplateSchema = object({
  /** id of the nameplate SKU */
  skuId: snowflake,
  /** path to the nameplate asset */
  asset: pipe(string(), url()),
  /** the label of this nameplate. Currently unused */
  label: pipe(string(), nonEmpty()),
  /** background color of the nameplate */
  palette: picklist([
    `crimson`,
    `berry`,
    `sky`,
    `teal`,
    `forest`,
    `bubble_gum`,
    `violet`,
    `cobalt`,
    `clover`,
    `lemon`,
    `white`
  ])
});

export interface Nameplate extends InferOutput<typeof nameplateSchema> {}
