import { z } from "zod";
import { welcomeChannel } from "./WelcomeChannel";

export const welcomeScreen = z.object({
  /** the server description shown in the welcome screen */
  description: z.string().optional(),
  /** the channels shown in the welcome screen, up to 5 */
  welcomeChannels: welcomeChannel.array()
});

export type WelcomeScreen = z.infer<typeof welcomeScreen>;
