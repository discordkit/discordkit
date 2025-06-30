import { picklist, type InferOutput } from "valibot";

export const servicesSchema = picklist([
  `amazon-music`,
  `battlenet`,
  `bungie`,
  `bluesky`,
  `crunchyroll`,
  `domain`,
  `ebay`,
  `epicgames`,
  `facebook`,
  `github`,
  `instagram`,
  `leagueoflegends`,
  `mastodon`,
  `paypal`,
  `playstation`,
  `reddit`,
  `riotgames`,
  `roblox`,
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
