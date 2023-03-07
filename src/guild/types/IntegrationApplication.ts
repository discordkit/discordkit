import type { User } from "../../user";

export interface IntegrationApplication {
  /** the id of the app */
  id: string;
  /** the name of the app */
  name: string;
  /** the icon hash of the app */
  icon?: string;
  /** the description of the app */
  description: string;
  /** the bot associated with this application */
  bot?: User;
}
