import { z } from "zod";

export enum MessageActivityType {
  JOIN = 1,
  SPECTATE = 2,
  LISTEN = 3,
  JOIN_REQUEST = 5
}

export const messageActivityType = z.nativeEnum(MessageActivityType);
