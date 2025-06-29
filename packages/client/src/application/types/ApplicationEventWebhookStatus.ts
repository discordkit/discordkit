import { enum_ } from "valibot";

/** Status indicating whether event webhooks are enabled or disabled for an application. */
export const ApplicationEventWebhookStatus = {
  /** Webhook events are disabled by developer */
  DISABLED: 1,
  /** Webhook events are enabled by developer */
  ENABLED: 2,
  /** Webhook events are disabled by Discord, usually due to inactivity */
  DISABLED_BY_DISCORD: 3
} as const;

export const applicationEventWebhookStatusSchema = enum_(
  ApplicationEventWebhookStatus
);
