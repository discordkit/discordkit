import { enum_ } from "valibot";

export enum SortOrderType {
  /** Sort forum posts by activity */
  LATEST_ACTIVITY = 0,
  /** Sort forum posts by creation time (from most recent to oldest) */
  CREATION_DATE = 1
}

export const sortOrderTypeSchema = enum_(SortOrderType);
