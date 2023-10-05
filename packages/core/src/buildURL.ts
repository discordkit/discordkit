import { endpoint } from "./DiscordSession.js";
import { addParams, type RequestParams } from "./addParams.js";

export const buildURL = <P extends RequestParams>(
  resource: string,
  params?: P,
  base?: string
): URL =>
  addParams(
    new URL(resource.replace(/^\//, ``), base ?? endpoint),
    params ?? {}
  );
