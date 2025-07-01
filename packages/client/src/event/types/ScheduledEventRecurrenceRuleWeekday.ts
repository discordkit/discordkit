import * as v from "valibot";

export enum ScheduledEventRecurrenceRuleWeekday {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7
}

export const scheduledEventRecurrenceRuleWeekdaySchema = v.enum_(
  ScheduledEventRecurrenceRuleWeekday
);

export const scheduledEventRecurrenceRuleNWeekdaySchema = v.object({
  n: v.picklist([1, 2, 3, 4, 5]),
  day: scheduledEventRecurrenceRuleWeekdaySchema
});

export interface ScheduledEventRecurrenceRuleNWeekday
  extends v.InferOutput<typeof scheduledEventRecurrenceRuleNWeekdaySchema> {}
