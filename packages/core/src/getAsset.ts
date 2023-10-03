import { buildURL } from "./buildURL.ts";

export const getAsset = (
  resource: string,
  params?: Parameters<typeof buildURL>[1]
): string => buildURL(resource, params, `https://cdn.discordapp.com/`).href;
