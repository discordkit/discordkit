import type { InferOutput } from "valibot";
import {
  array,
  integer,
  isoTimestamp,
  maxValue,
  minValue,
  nullable,
  number,
  object,
  pipe,
  string
} from "valibot";
import { scheduledEventRecurrenceRuleFrequencySchema } from "./ScheduledEventRecurrenceRuleFrequency.js";
import {
  scheduledEventRecurrenceRuleNWeekdaySchema,
  scheduledEventRecurrenceRuleWeekdaySchema
} from "./ScheduledEventRecurrenceRuleWeekday.js";
import { scheduledEventRecurrenceRuleMonthSchema } from "./ScheduledEventRecurrenceRuleMonth.js";

/**
 * Discord's recurrence rule is a subset of the behaviors [defined in the iCalendar RFC](https://datatracker.ietf.org/doc/html/rfc5545) and implemented by [python's dateutil rule](https://dateutil.readthedocs.io/en/stable/rrule.html)
 */
export const scheduledEventRecurrenceRuleSchema = object({
  /** Starting time of the recurrence interval */
  start: pipe(string(), isoTimestamp()),
  /** Ending time of the recurrence interval */
  end: nullable(pipe(string(), isoTimestamp())),
  /** How often the event occurs */
  frequency: scheduledEventRecurrenceRuleFrequencySchema,
  /** The spacing between the events, defined by `frequency`. For example, `frequency` of `WEEKLY` and an `interval` of `2` would be "every-other week" */
  interval: pipe(number(), integer(), minValue(1)),
  /** Set of specific days within a week for the event to recur on */
  byWeekday: nullable(array(scheduledEventRecurrenceRuleWeekdaySchema)),
  /** List of specific days within a specific week (1-5) to recur on */
  byNWeekday: nullable(array(scheduledEventRecurrenceRuleNWeekdaySchema)),
  /** Set of specific months to recur on */
  byMonth: nullable(array(scheduledEventRecurrenceRuleMonthSchema)),
  /** Set of specific dates within a month to recur on */
  byMonthDay: nullable(
    array(pipe(number(), integer(), minValue(1), maxValue(31)))
  ),
  /** Set of days within a year to recur on (1-364) */
  byYearDay: nullable(
    array(pipe(number(), integer(), minValue(1), maxValue(364)))
  ),
  /** The total amount of times that the event is allowed to recur before stopping */
  count: nullable(pipe(number(), integer(), minValue(1)))
});

export interface ScheduledEventRecurrenceRule
  extends InferOutput<typeof scheduledEventRecurrenceRuleSchema> {}
