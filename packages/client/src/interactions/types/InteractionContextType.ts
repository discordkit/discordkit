import * as v from "valibot";

/**
 * Context in Discord where an interaction can be used, or where it was triggered from. Details about using interaction contexts for application commands is in the commands context documentation.
 */
export const InteractionContextType = {
  /** Interaction can be used within servers */
  GUILD: 1,
  /** Interaction can be used within DMs with the app's bot user */
  BOT_DM: 2,
  /** Interaction can be used within Group DMs and DMs other than the app's bot user */
  PRIVATE_CHANNEL: 3
} as const;

export const interactionContextSchema = v.enum_(InteractionContextType);
