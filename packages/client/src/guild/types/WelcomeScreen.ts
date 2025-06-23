import {
  type InferOutput,
  object,
  string,
  optional,
  array,
  maxLength,
  pipe
} from "valibot";
import { welcomeChannelSchema } from "./WelcomeChannel.js";

export const welcomeScreenSchema = object({
  /** the server description shown in the welcome screen */
  description: optional(string()),
  /** the channels shown in the welcome screen, up to 5 */
  welcomeChannels: pipe(array(welcomeChannelSchema), maxLength(5))
});

export type WelcomeScreen = InferOutput<typeof welcomeScreenSchema>;
