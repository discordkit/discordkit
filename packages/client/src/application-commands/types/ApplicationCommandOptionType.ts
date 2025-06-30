import { enum_ } from "valibot";

export const ApplicationCommandOptionType = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  /** Any integer between -2^53 and 2^53 */
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  /** Includes all channel types + categories */
  CHANNEL: 7,
  ROLE: 8,
  /** Includes users and roles */
  MENTIONABLE: 9,
  /** Any double between -2^53 and 2^53 */
  NUMBER: 10,
  /** attachment object */
  ATTACHMENT: 11
} as const;

export const applicationCommandOptionTypeSchema = enum_(
  ApplicationCommandOptionType
);
