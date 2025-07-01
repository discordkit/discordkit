import * as v from "valibot";

export enum ScheduledEventRecurrenceRuleFrequency {
  YEARLY = 0,
  MONTHLY = 1,
  WEEKLY = 2,
  DAILY = 3
}

export const scheduledEventRecurrenceRuleFrequencySchema = v.enum_(
  ScheduledEventRecurrenceRuleFrequency
);
