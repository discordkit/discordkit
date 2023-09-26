import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import {
  type ApplicationCommand,
  applicationCommandSchema
} from "./types/ApplicationCommand";

export const getGlobalApplicationCommandSchema = z.object({
  application: z.string().min(1),
  command: z.string().min(1)
});

/**
 * ### [Get Global Application Command](https://discord.com/developers/docs/interactions/application-commands#get-global-application-command)
 *
 * **GET** `/applications/:application/commands/:command`
 *
 * Fetch a global command for your application. Returns an {@link ApplicationCommand | application command object}.
 */
export const getGlobalApplicationCommand: Fetcher<
  typeof getGlobalApplicationCommandSchema,
  ApplicationCommand
> = async ({ application, command }) =>
  get(`/applications/${application}/commands/${command}`);

/** @see getGlobalApplicationCommand */
export const getGlobalApplicationCommandProcedure = toProcedure(
  `query`,
  getGlobalApplicationCommand,
  getGlobalApplicationCommandSchema,
  applicationCommandSchema
);

export const getGlobalApplicationCommandQuery = toQuery(
  getGlobalApplicationCommand
);
