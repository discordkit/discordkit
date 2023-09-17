import { z } from "zod";
import { user } from "../../user/types/User";
import { team } from "./Team";
import { installParams } from "./InstallParams";
import { applicationFlags } from "./ApplicationFlags";

// https://discord.com/developers/docs/resources/application#application-object-application-structure

export const application = z.object({
  /** the id of the app */
  id: z.string(),
  /** the name of the app */
  name: z.string(),
  /** the icon hash of the app */
  icon: z.string().optional(),
  /** the description of the app */
  description: z.string(),
  /** an array of rpc origin urls, if rpc is enabled */
  rpcOrigins: z.string().array().optional(),
  /** when false only app owner can join the app's bot to guilds */
  botPublic: z.boolean(),
  /** when true the app's bot will only join upon completion of the full oauth2 code grant flow */
  botRequireCodeGrant: z.boolean(),
  /** the url of the app's terms of service */
  termsOfServiceUrl: z.string().optional(),
  /** the url of the app's privacy policy */
  privacyPolicyUrl: z.string().optional(),
  /** partial user object containing info on the owner of the application */
  owner: user.partial().optional(),
  /** the hex encoded key for verification in interactions and the GameSDK's GetTicket */
  verifyKey: z.string(),
  /** if the application belongs to a team, this will be a list of the members of that team */
  team: team.optional(),
  /** if this application is a game sold on Discord, this field will be the guild to which it has been linked */
  guildId: z.string().optional(),
  /** if this application is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists */
  primarySkuId: z.string().optional(),
  /** if this application is a game sold on Discord, this field will be the URL slug that links to the store page */
  slug: z.string().optional(),
  /** the application's default rich presence invite cover image hash */
  coverImage: z.string().optional(),
  /** the application's public flags */
  flags: applicationFlags.optional(),
  /** up to 5 tags describing the content and functionality of the application */
  tags: z.string().array().optional(),
  /** settings for the application's default in-app authorization link, if enabled */
  installParams: installParams.optional(),
  /** the application's default custom authorization link, if enabled */
  customInstallUrl: z.string().optional()
});

export type Application = z.infer<typeof application>;
