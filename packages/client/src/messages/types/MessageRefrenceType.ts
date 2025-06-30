import { enum_ } from "valibot";

export enum MessageReferenceType {
  /** A standard reference used by replies. */
  DEFAULT = 0,
  /** Reference used to point to a message at a point in time. */
  FORWARD = 1
}

export const messageReferenceTypeSchema = enum_(MessageReferenceType);
