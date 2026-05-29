import * as v from "valibot";

/**
 * Determines whether a `PRIMARY_ENTRY_POINT` command's interaction is
 * handled by the app's interactions handler or by Discord.
 */
export const EntryPointCommandHandlerType = {
  /** The app handles the interaction using an interaction token */
  APP_HANDLER: 1,
  /**
   * Discord handles the interaction by launching an Activity and sending
   * a follow-up message without coordinating with the app
   */
  DISCORD_LAUNCH_ACTIVITY: 2
} as const;

export const entryPointCommandHandlerTypeSchema = v.enum_(
  EntryPointCommandHandlerType
);
