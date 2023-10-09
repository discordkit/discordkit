import { nativeEnum } from "valibot";

export enum MessageActivityType {
  JOIN = 1,
  SPECTATE = 2,
  LISTEN = 3,
  JOIN_REQUEST = 5
}

export const messageActivityTypeSchema = nativeEnum(MessageActivityType);
