import { union, literal, type InferOutput } from "valibot";

export const servicesSchema = union([
  literal(`battlenet`),
  literal(`ebay`),
  literal(`epicgames`),
  literal(`facebook`),
  literal(`github`),
  literal(`instagram`),
  literal(`leagueoflegends`),
  literal(`paypal`),
  literal(`playstation`),
  literal(`reddit`),
  literal(`riotgames`),
  literal(`spotify`),
  literal(`skype`),
  literal(`steam`),
  literal(`tiktok`),
  literal(`twitch`),
  literal(`twitter`),
  literal(`xbox`),
  literal(`youtube`)
]);

export type Services = InferOutput<typeof servicesSchema>;
