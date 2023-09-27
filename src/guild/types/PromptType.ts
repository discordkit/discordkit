import { z } from "zod";

export enum PromptType {
  MULTIPLE_CHOICE = 0,
  DROPDOWN = 1
}

export const promptTypeSchema = z.nativeEnum(PromptType);
