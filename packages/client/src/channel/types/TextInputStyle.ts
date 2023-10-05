import { z } from "zod";

export enum TextInputStyle {
  /** Single-line input */
  Short = 1,
  /** Multi-line input */
  Paragraph = 2
}

export const textInputStyleSchema = z.nativeEnum(TextInputStyle);
