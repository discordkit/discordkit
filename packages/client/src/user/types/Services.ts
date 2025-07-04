import * as v from "valibot";

export const services = [
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
] as const;

export type Services = (typeof services)[number];

export const servicesSchema = v.picklist(services) as v.GenericSchema<Services>;
