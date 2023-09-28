import { discord } from "#/DiscordSession.ts";
import type { RequestParams } from "./addParams.ts";
import { addParams } from "./addParams.ts";

export const buildURL = <P extends RequestParams>(
  resource: string,
  params?: P
): URL =>
  addParams(
    new URL(resource.replace(/^\//, ``), discord.endpoint),
    params ?? {}
  );
