import { z } from "zod";
import { welcomeChannelSchema } from "./WelcomeChannel.js";

export const welcomeScreenSchema = z.object({
  /** the server description shown in the welcome screen */
  description: z.string().optional(),
  /** the channels shown in the welcome screen, up to 5 */
  welcomeChannels: welcomeChannelSchema.array().max(5)
});

export type WelcomeScreen = z.infer<typeof welcomeScreenSchema>;
