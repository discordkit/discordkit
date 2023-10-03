import { endpoint } from "./DiscordSession.ts";
import { addParams, type RequestParams } from "./addParams.ts";

export const buildURL = <P extends RequestParams>(
  resource: string,
  params?: P,
  base?: string
): URL =>
  addParams(
    new URL(resource.replace(/^\//, ``), base ?? endpoint),
    params ?? {}
  );
