import * as v from "valibot";

export enum TextInputStyle {
  /** Single-line input */
  Short = 1,
  /** Multi-line input */
  Paragraph = 2
}

export const textInputStyleSchema = v.enum_(TextInputStyle);
