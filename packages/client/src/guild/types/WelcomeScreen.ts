import {
  type InferOutput,
  object,
  string,
  nullable,
  array,
  maxLength,
  pipe
} from "valibot";
import { welcomeChannelSchema } from "./WelcomeChannel.js";

export const welcomeScreenSchema = object({
  /** the server description shown in the welcome screen */
  description: nullable(string()),
  /** the channels shown in the welcome screen, up to 5 */
  welcomeChannels: pipe(array(welcomeChannelSchema), maxLength(5))
});

export interface WelcomeScreen
  extends InferOutput<typeof welcomeScreenSchema> {}
