import { type User } from "../../user";

export interface Emoji {
  /** emoji id */
  id?: string;
  /** (can be null only in reaction emoji objects)	emoji name */
  name?: string;
  /** roles allowed to use this emoji */
  roles?: string[];
  /** user that created this emoji */
  user?: User;
  /** whether this emoji must be wrapped in colons */
  requireColons?: boolean;
  /** whether this emoji is managed */
  managed?: boolean;
  /** whether this emoji is animated */
  animated?: boolean;
  /** whether this emoji can be used, may be false due to loss of Server Boosts */
  available?: boolean;
}
