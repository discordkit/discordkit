import { enum_ } from "valibot";

export enum ButtonStyle {
  /** The most important or recommended action in a group of options (Required Field: `customId`) */
  Primary = 1,
  /** Alternative or supporting actions (Required Field: `customId`) */
  Secondary = 2,
  /** Positive confirmation or completion actions (Required Field: `customId`) */
  Success = 3,
  /** An action with irreversible consequences (Required Field: `customId`) */
  Danger = 4,
  /** Navigates to a URL (Required Field: `url`) */
  Link = 5,
  /** Purchase (Required Field: `skuId`) */
  Premium = 6
}

export const buttonStyleSchema = enum_(ButtonStyle);
