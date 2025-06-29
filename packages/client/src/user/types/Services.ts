import { picklist, type InferOutput } from "valibot";

export const servicesSchema = picklist([
  `battlenet`,
  `ebay`,
  `epicgames`,
  `facebook`,
  `github`,
  `instagram`,
  `leagueoflegends`,
  `paypal`,
  `playstation`,
  `reddit`,
  `riotgames`,
  `spotify`,
  `skype`,
  `steam`,
  `tiktok`,
  `twitch`,
  `twitter`,
  `xbox`,
  `youtube`
]);

export type Services = InferOutput<typeof servicesSchema>;
