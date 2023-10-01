import { z } from "zod";

export enum GuildFeatures {
  /** guild has access to set an animated guild banner image */
  ANIMATED_BANNER = `ANIMATED_BANNER`,
  /** guild has access to set an animated guild icon */
  ANIMATED_ICON = `ANIMATED_ICON`,
  /** guild is using the old permissions configuration behavior */
  APPLICATION_COMMAND_PERMISSIONS_V2 = `APPLICATION_COMMAND_PERMISSIONS_V2`,
  /** guild has set up auto moderation rules */
  AUTO_MODERATION = `AUTO_MODERATION`,
  /** guild has access to set a guild banner image */
  BANNER = `BANNER`,
  /** guild can enable welcome screen, Membership Screening, stage channels and discovery, and receives community updates */
  COMMUNITY = `COMMUNITY`,
  /** guild has enabled monetization */
  CREATOR_MONETIZABLE_PROVISIONAL = `CREATOR_MONETIZABLE_PROVISIONAL`,
  /** guild has enabled the role subscription promo page */
  CREATOR_STORE_PAGE = `CREATOR_STORE_PAGE`,
  /** guild has been set as a support server on the App Directory */
  DEVELOPER_SUPPORT_SERVER = `DEVELOPER_SUPPORT_SERVER`,
  /** guild is able to be discovered in the directory */
  DISCOVERABLE = `DISCOVERABLE`,
  /** guild is able to be featured in the directory */
  FEATURABLE = `FEATURABLE`,
  /** guild has paused invites, preventing new users from joining */
  INVITES_DISABLED = `INVITES_DISABLED`,
  /** guild has access to set an invite splash background */
  INVITE_SPLASH = `INVITE_SPLASH`,
  /** guild has enabled Membership Screening */
  MEMBER_VERIFICATION_GATE_ENABLED = `MEMBER_VERIFICATION_GATE_ENABLED`,
  /** guild has increased custom sticker slots */
  MORE_STICKERS = `MORE_STICKERS`,
  /** guild has access to create news channels */
  NEWS = `NEWS`,
  /** guild is partnered */
  PARTNERED = `PARTNERED`,
  /** guild can be previewed before joining via Membership Screening or the directory */
  PREVIEW_ENABLED = `PREVIEW_ENABLED`,
  /** guild has disabled alerts for join raids in the configured safety alerts channel */
  RAID_ALERTS_DISABLED = `RAID_ALERTS_DISABLED`,
  /** guild is able to set role icons */
  ROLE_ICONS = `ROLE_ICONS`,
  /** guild has role subscriptions that can be purchased */
  ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE = `ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE`,
  /** guild has enabled role subscriptions */
  ROLE_SUBSCRIPTIONS_ENABLED = `ROLE_SUBSCRIPTIONS_ENABLED`,
  /** guild has enabled ticketed events */
  TICKETED_EVENTS_ENABLED = `TICKETED_EVENTS_ENABLED`,
  /** guild has access to set a vanity URL */
  VANITY_URL = `VANITY_URL`,
  /** guild is verified */
  VERIFIED = `VERIFIED`,
  /** guild has access to set 384kbps bitrate in voice (previously VIP voice servers) */
  VIP_REGIONS = `VIP_REGIONS`,
  /** guild has enabled the welcome screen */
  WELCOME_SCREEN_ENABLED = `WELCOME_SCREEN_ENABLED`
}

export const guildFeaturesSchema = z.nativeEnum(GuildFeatures);
