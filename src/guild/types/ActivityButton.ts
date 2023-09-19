import { z } from "zod";

/** When received over the gateway, the buttons field is an array of strings, which are the button labels. Bots cannot access a user's activity button URLs. When sending, the buttons field must be an array of the below object: */
export const activityButtonSchema = z.object({
  /** the text shown on the button (1-32 characters) */
  label: z.string(),
  /** the url opened when clicking the button (1-512 characters) */
  url: z.string()
});

export type ActivityButton = z.infer<typeof activityButtonSchema>;
