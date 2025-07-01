import * as v from "valibot";

export enum MessageActivityType {
  JOIN = 1,
  SPECTATE = 2,
  LISTEN = 3,
  JOIN_REQUEST = 5
}

export const messageActivityTypeSchema = v.enum_(MessageActivityType);
