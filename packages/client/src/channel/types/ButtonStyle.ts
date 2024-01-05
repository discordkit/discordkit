import { enum_ } from "valibot";

export enum ButtonStyle {
  /** blurple*/
  Primary = 1,
  /** grey */
  Secondary = 2,
  /** green*/
  Success = 3,
  /** red */
  Danger = 4,
  /** grey, navigates to a URL */
  Link = 5
}

export const buttonStyleSchema = enum_(ButtonStyle);
