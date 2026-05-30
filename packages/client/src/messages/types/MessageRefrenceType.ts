import * as v from "valibot";

/**
 * ### [Message Reference Type](https://discord.com/developers/docs/resources/message#message-reference-object)
 */
export enum MessageReferenceType {
  /** A standard reference used by replies. */
  DEFAULT = 0,
  /** Reference used to point to a message at a point in time. */
  FORWARD = 1
}

export const messageReferenceTypeSchema = v.enum_(MessageReferenceType);
