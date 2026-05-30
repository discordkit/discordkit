import * as v from "valibot";

/**
 * ### [Message Activity Type](https://discord.com/developers/docs/resources/message#message-object-message-activity-types)
 */
export enum MessageActivityType {
  JOIN = 1,
  SPECTATE = 2,
  LISTEN = 3,
  JOIN_REQUEST = 5
}

export const messageActivityTypeSchema = v.enum_(MessageActivityType);
