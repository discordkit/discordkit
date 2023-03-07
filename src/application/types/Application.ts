import type { User } from "../../user";
import type { Team } from "./Team";
import type { InstallParams } from "./InstallParams";
import type { ApplicationFlags } from "./ApplicationFlags";

// https://discord.com/developers/docs/resources/application#application-object-application-structure

export interface Application {
  /** the id of the app */
  id: string;
  /** the name of the app */
  name: string;
  /** the icon hash of the app */
  icon?: string;
  /** the description of the app */
  description: string;
  /** an array of rpc origin urls, if rpc is enabled */
  rpcOrigins?: string[];
  /** when false only app owner can join the app's bot to guilds */
  botPublic: boolean;
  /** when true the app's bot will only join upon completion of the full oauth2 code grant flow */
  botRequireCodeGrant: boolean;
  /** the url of the app's terms of service */
  termsOfServiceUrl?: string;
  /** the url of the app's privacy policy */
  privacyPolicyUrl?: string;
  /** partial user object containing info on the owner of the application */
  owner?: Partial<User>;
  /** the hex encoded key for verification in interactions and the GameSDK's GetTicket */
  verifyKey: string;
  /** if the application belongs to a team, this will be a list of the members of that team */
  team?: Team;
  /** if this application is a game sold on Discord, this field will be the guild to which it has been linked */
  guildId?: string;
  /** if this application is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists */
  primarySkuId?: string;
  /** if this application is a game sold on Discord, this field will be the URL slug that links to the store page */
  slug?: string;
  /** the application's default rich presence invite cover image hash */
  coverImage?: string;
  /** the application's public flags */
  flags?: ApplicationFlags;
  /** up to 5 tags describing the content and functionality of the application */
  tags?: string[];
  /** settings for the application's default in-app authorization link, if enabled */
  installParams?: InstallParams;
  /** the application's default custom authorization link, if enabled */
  customInstallUrl?: string;
}
