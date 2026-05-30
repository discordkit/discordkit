import * as v from "valibot";

/**
 * ### [Sort Order Type](https://discord.com/developers/docs/resources/channel#channel-object-sort-order-types)
 */
export enum SortOrderType {
  /** Sort forum posts by activity */
  LATEST_ACTIVITY = 0,
  /** Sort forum posts by creation time (from most recent to oldest) */
  CREATION_DATE = 1
}

export const sortOrderTypeSchema = v.enum_(SortOrderType);
