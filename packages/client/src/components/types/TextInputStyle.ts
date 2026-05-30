import * as v from "valibot";

/**
 * ### [Text Input Style](https://discord.com/developers/docs/components/reference#text-input-text-input-styles)
 */
export enum TextInputStyle {
  /** Single-line input */
  Short = 1,
  /** Multi-line input */
  Paragraph = 2
}

export const textInputStyleSchema = v.enum_(TextInputStyle);
