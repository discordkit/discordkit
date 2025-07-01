import * as v from "valibot";
import { welcomeChannelSchema } from "./WelcomeChannel.js";

export const welcomeScreenSchema = v.object({
  /** the server description shown in the welcome screen */
  description: v.nullable(v.string()),
  /** the channels shown in the welcome screen, up to 5 */
  welcomeChannels: v.pipe(v.array(welcomeChannelSchema), v.maxLength(5))
});

export interface WelcomeScreen
  extends v.InferOutput<typeof welcomeScreenSchema> {}
