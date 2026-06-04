import { buildURL } from "./buildURL.js";

/** @__NO_SIDE_EFFECTS__ */
export const getAsset = (
  resource: string,
  params?: Parameters<typeof buildURL>[1]
): string => buildURL(resource, params, `https://cdn.discordapp.com/`).href;
