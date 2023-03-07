import type { WelcomeChannel } from "./WelcomeChannel";

export interface WelcomeScreen {
  /** the server description shown in the welcome screen */
  description?: string;
  /** the channels shown in the welcome screen, up to 5 */
  welcomeChannels: WelcomeChannel[];
}
