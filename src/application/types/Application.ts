import { z } from "zod";
import { userSchema } from "../../user/types/User";
import { teamSchema } from "./Team";
import { installParamsSchema } from "./InstallParams";
import { applicationFlagsSchema } from "./ApplicationFlags";

// https://discord.com/developers/docs/resources/application#application-object-application-structure

export const applicationSchema = z.object({
  /** the id of the app */
  id: z.string(),
  /** the name of the app */
  name: z.string(),
  /** the icon hash of the app */
  icon: z.string().nullable(),
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
  owner: userSchema.partial().optional(),
  /** the hex encoded key for verification in interactions and the GameSDK's GetTicket */
  verifyKey: z.string(),
  /** if the application belongs to a team, this will be a list of the members of that team */
  team: teamSchema.optional(),
  /** if this application is a game sold on Discord, this field will be the guild to which it has been linked */
  guildId: z.string().nullable(),
  /** if this application is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists */
  primarySkuId: z.string().nullable(),
  /** if this application is a game sold on Discord, this field will be the URL slug that links to the store page */
  slug: z.string().nullable(),
  /** the application's default rich presence invite cover image hash */
  coverImage: z.string().nullable(),
  /** the application's public flags */
  flags: applicationFlagsSchema.nullable(),
  /** an approximate count of the app's guild membership */
  approximateGuildCount: z.number().int().nullable(),
  /** up to 5 tags describing the content and functionality of the application */
  tags: z.string().array().nullable(),
  /** settings for the application's default in-app authorization link, if enabled */
  installParams: installParamsSchema.nullable(),
  /** the application's default custom authorization link, if enabled */
  customInstallUrl: z.string().nullable(),
  /** the application's role connection verification entry point, which when configured will render the app as a verification method in the guild role verification configuration */
  roleConnectionsVerificationUrl: z.string().nullable()
});

export type Application = z.infer<typeof applicationSchema>;
