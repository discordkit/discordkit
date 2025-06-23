import { enum_ } from "valibot";

export enum TextInputStyle {
  /** Single-line input */
  Short = 1,
  /** Multi-line input */
  Paragraph = 2
}

export const textInputStyleSchema = enum_(TextInputStyle);
