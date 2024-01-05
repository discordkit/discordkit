import {
  object,
  nullish,
  string,
  boolean,
  optional,
  partial,
  array,
  number,
  integer,
  minValue,
  type Output
} from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { teamSchema } from "./Team.js";

// https://discord.com/developers/docs/resources/application#application-object-application-structure

export const applicationSchema = object({
  /** the id of the app */
  id: snowflake,
  /** the name of the app */
  name: string(),
  /** the icon hash of the app */
  icon: nullish(string()),
  /** the description of the app */
  description: string(),
  /** an array of rpc origin urls, if rpc is enabled */
  rpcOrigins: optional(array(string())),
  /** when false only app owner can join the app's bot to guilds */
  botPublic: boolean(),
  /** when true the app's bot will only join upon completion of the full oauth2 code grant flow */
  botRequireCodeGrant: boolean(),
  /** the url of the app's terms of service */
  termsOfServiceUrl: optional(string()),
  /** the url of the app's privacy policy */
  privacyPolicyUrl: optional(string()),
  /** partial user object containing info on the owner of the application */
  owner: optional(partial(userSchema)),
  /** the hex encoded key for verification in interactions and the GameSDK's GetTicket */
  verifyKey: string(),
  /** if the application belongs to a team, this will be a list of the members of that team */
  team: nullish(teamSchema),
  /** if this application is a game sold on Discord, this field will be the guild to which it has been linked */
  guildId: nullish(string()),
  /** if this application is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists */
  primarySkuId: nullish(string()),
  /** if this application is a game sold on Discord, this field will be the URL slug that links to the store page */
  slug: nullish(string()),
  /** the application's default rich presence invite cover image hash */
  coverImage: nullish(string()),
  /** the application's public flags */
  flags: nullish(number([integer()])),
  /** an approximate count of the app's guild membership */
  approximateGuildCount: nullish(number([integer(), minValue(0)])),
  /** up to 5 tags describing the content and functionality of the application */
  tags: nullish(array(string())),
  /** settings for the application's default in-app authorization link, if enabled */
  installParams: nullish(number([integer()])),
  /** the application's default custom authorization link, if enabled */
  customInstallUrl: nullish(string()),
  /** the application's role connection verification entry point, which when configured will render the app as a verification method in the guild role verification configuration */
  roleConnectionsVerificationUrl: nullish(string())
});

export type Application = Output<typeof applicationSchema>;
