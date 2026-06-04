import { endpoint } from "./DiscordSession.js";
import { addParams, type RequestParams } from "./addParams.js";

/** @__NO_SIDE_EFFECTS__ */
export const buildURL = (
  resource: string,
  params?: RequestParams,
  base?: string
): URL =>
  addParams(
    new URL(resource.replace(/^\//, ``), base ?? endpoint),
    params ?? {}
  );
