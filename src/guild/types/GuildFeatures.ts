import { z } from "zod";

export enum GuildFeatures {
  /** guild has access to set an animated guild icon */
  ANIMATED_ICON = `ANIMATED_ICON`,
  /** guild has access to set a guild banner image */
  BANNER = `BANNER`,
  /** guild has access to use commerce features (i.e. create store channels) */
  COMMERCE = `COMMERCE`,
  /** guild can enable welcome screen, Membership Screening, stage channels and discovery, and receives community updates */
  COMMUNITY = `COMMUNITY`,
  /** guild is able to be discovered in the directory */
  DISCOVERABLE = `DISCOVERABLE`,
  /** guild is able to be featured in the directory */
  FEATURABLE = `FEATURABLE`,
  /** guild has access to set an invite splash background */
  INVITE_SPLAS = `INVITE_SPLASH`,
  /** guild has enabled Membership Screening */
  MEMBER_VERIFICATION_GATE_ENABLED = `MEMBER_VERIFICATION_GATE_ENABLED`,
  /** guild has enabled monetization */
  MONETIZATION_ENABLED = `MONETIZATION_ENABLED`,
  /** guild has increased custom sticker slots */
  MORE_STICKERS = `MORE_STICKERS`,
  /** guild has access to create news channels */
  NEWS = `NEWS`,
  /** guild is partnered */
  PARTNERED = `PARTNERED`,
  /** guild can be previewed before joining via Membership Screening or the directory */
  PREVIEW_ENABLED = `PREVIEW_ENABLED`,
  /** guild has access to create private threads */
  PRIVATE_THREADS = `PRIVATE_THREADS`,
  /** guild is able to set role icons */
  ROLE_ICONS = `ROLE_ICONS`,
  /** guild has access to the seven day archive time for threads */
  SEVEN_DAY_THREAD_ARCHIVE = `SEVEN_DAY_THREAD_ARCHIVE`,
  /** guild has access to the three day archive time for threads */
  THREE_DAY_THREAD_ARCHIVE = `THREE_DAY_THREAD_ARCHIVE`,
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
