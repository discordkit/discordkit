import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { type Application, applicationSchema } from "./types/Application";

/**
 * ### [Get Current Application](https://discord.com/developers/docs/resources/application#get-current-application)
 *
 * **GET** `/applications/@me`
 *
 * Returns the {@link Application | application object} associated with the requesting bot user.
 */
export const getCurrentApplication: Fetcher<null, Application> = async () =>
  get(`/applications/@me`);

export const getCurrentApplicationProcedure = toProcedure(
  `query`,
  getCurrentApplication,
  null,
  applicationSchema
);

export const getCurrentApplicationQuery = toQuery(getCurrentApplication);
