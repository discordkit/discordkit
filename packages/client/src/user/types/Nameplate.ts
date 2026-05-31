import * as v from "valibot";
import { snowflake, boundedString, url, schema } from "@discordkit/core";

const _nameplateSchema = v.object({
  /** id of the nameplate SKU */
  skuId: snowflake,
  /** path to the nameplate asset */
  asset: url,
  /** the label of this nameplate. Currently unused */
  label: boundedString(),
  /** background color of the nameplate */
  palette: v.picklist([
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

export interface Nameplate extends v.InferOutput<typeof _nameplateSchema> {}

/**
 * ### [Nameplate](https://discord.com/developers/docs/resources/user#nameplate)
 *
 * The nameplate the user has.
 */
export const nameplateSchema = schema<Nameplate>(_nameplateSchema);
