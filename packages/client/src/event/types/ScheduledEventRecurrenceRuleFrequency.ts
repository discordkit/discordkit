import { enum_ } from "valibot";

export enum ScheduledEventRecurrenceRuleFrequency {
  YEARLY = 0,
  MONTHLY = 1,
  WEEKLY = 2,
  DAILY = 3
}

export const scheduledEventRecurrenceRuleFrequencySchema = enum_(
  ScheduledEventRecurrenceRuleFrequency
);
