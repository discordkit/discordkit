import type { RequestParams } from "./addParams";
import { addParams } from "./addParams";
import { discord } from "../DiscordSession";

export const buildURL = <P extends RequestParams>(
  resource: string,
  params?: P
): URL =>
  addParams(
    new URL(resource.replace(/^\//, ``), discord.endpoint),
    params ?? {}
  );
