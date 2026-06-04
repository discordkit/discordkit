import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Entitlement } from "./types/Entitlement.js";

export const getEntitlementSchema = v.object({
  application: snowflake,
  entitlement: snowflake
});

/**
 * ### [Get Entitlement](https://discord.com/developers/docs/resources/entitlement#get-entitlement)
 *
 * **GET** `/applications/:application/entitlements/:entitlement`
 *
 * Returns an entitlement.
 *
 * ```json
 * {
 *   "id": "1019653849998299136",
 *   "sku_id": "1019475255913222144",
 *   "application_id": "1019370614521200640",
 *   "user_id": "771129655544643584",
 *   "promotion_id": null,
 *   "type": 8,
 *   "deleted": false,
 *   "gift_code_flags": 0,
 *   "consumed": false,
 *   "starts_at": "2022-09-14T17:00:18.704163+00:00",
 *   "ends_at": "2022-10-14T17:00:18.704163+00:00",
 *   "guild_id": "1015034326372454400",
 *   "subscription_id": "1019653835926409216"
 * }
 * ```
 */
export const getEntitlement: Fetcher<
  typeof getEntitlementSchema,
  Entitlement
> = async ({ application, entitlement }) =>
  get(`/applications/${application}/entitlements/${entitlement}`);
