import { z } from "zod";

export const servicesSchema = z.union([
  z.literal(`battlenet`),
  z.literal(`ebay`),
  z.literal(`epicgames`),
  z.literal(`facebook`),
  z.literal(`github`),
  z.literal(`instagram`),
  z.literal(`leagueoflegends`),
  z.literal(`paypal`),
  z.literal(`playstation`),
  z.literal(`reddit`),
  z.literal(`riotgames`),
  z.literal(`spotify`),
  z.literal(`skype`),
  z.literal(`steam`),
  z.literal(`tiktok`),
  z.literal(`twitch`),
  z.literal(`twitter`),
  z.literal(`xbox`),
  z.literal(`youtube`)
]);

export type Services = z.infer<typeof servicesSchema>;
