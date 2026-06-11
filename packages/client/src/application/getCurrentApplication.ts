import { get, type Fetcher } from "@discordkit/core/requests/methods";
import type { Application } from "./types/Application.js";

/**
 * ### [Get Current Application](https://discord.com/developers/docs/resources/application#get-current-application)
 *
 * **GET** `/applications/@me`
 *
 * Returns the {@link Application | application object} associated with the requesting bot user.
 */
export const getCurrentApplication: Fetcher<null, Application> = async () =>
  get(`/applications/@me`);
