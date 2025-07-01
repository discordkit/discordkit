import { object, picklist, enum_, type InferOutput } from "valibot";

export enum ScheduledEventRecurrenceRuleWeekday {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7
}

export const scheduledEventRecurrenceRuleWeekdaySchema = enum_(
  ScheduledEventRecurrenceRuleWeekday
);

export const scheduledEventRecurrenceRuleNWeekdaySchema = object({
  n: picklist([1, 2, 3, 4, 5]),
  day: scheduledEventRecurrenceRuleWeekdaySchema
});

export interface ScheduledEventRecurrenceRuleNWeekday
  extends InferOutput<typeof scheduledEventRecurrenceRuleNWeekdaySchema> {}
