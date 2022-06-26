export interface Stage {
  /** The id of this Stage instance */
  id: string;
  /** The guild id of the associated Stage channel */
  guildId: string;
  /** The id of the associated Stage channel */
  channelId: string;
  /** The topic of the Stage instance (1-120 characters) */
  topic: string;
  /** The privacy level of the Stage instance */
  privacyLevel: StagePrivacyLevel;
  /** @deprecated Whether or not Stage Discovery is disabled */
  discoverableDisabled: boolean;
}

export enum StagePrivacyLevel {
  /** @deprecated The Stage instance is visible publicly. */
  PUBLIC = 1,
  /** The Stage instance is visible to only guild members. */
  GUILD_ONLY = 2
}
