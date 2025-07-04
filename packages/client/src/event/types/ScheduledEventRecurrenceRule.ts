import * as v from "valibot";
import { timestamp } from "@discordkit/core";
import { scheduledEventRecurrenceRuleFrequencySchema } from "./ScheduledEventRecurrenceRuleFrequency.js";
import {
  scheduledEventRecurrenceRuleNWeekdaySchema,
  scheduledEventRecurrenceRuleWeekdaySchema
} from "./ScheduledEventRecurrenceRuleWeekday.js";
import { scheduledEventRecurrenceRuleMonthSchema } from "./ScheduledEventRecurrenceRuleMonth.js";

/**
 * Discord's recurrence rule is a subset of the behaviors [defined in the iCalendar RFC](https://datatracker.ietf.org/doc/html/rfc5545) and implemented by [python's dateutil rule](https://dateutil.readthedocs.io/en/stable/rrule.html)
 */
export const scheduledEventRecurrenceRuleSchema = v.object({
  /** Starting time of the recurrence interval */
  start: timestamp,
  /** Ending time of the recurrence interval */
  end: v.nullable(timestamp),
  /** How often the event occurs */
  frequency: scheduledEventRecurrenceRuleFrequencySchema,
  /** The spacing between the events, defined by `frequency`. For example, `frequency` of `WEEKLY` and an `interval` of `2` would be "every-other week" */
  interval: v.pipe(v.number(), v.integer(), v.minValue(1)),
  /** Set of specific days within a week for the event to recur on */
  byWeekday: v.nullable(v.array(scheduledEventRecurrenceRuleWeekdaySchema)),
  /** List of specific days within a specific week (1-5) to recur on */
  byNWeekday: v.nullable(v.array(scheduledEventRecurrenceRuleNWeekdaySchema)),
  /** Set of specific months to recur on */
  byMonth: v.nullable(v.array(scheduledEventRecurrenceRuleMonthSchema)),
  /** Set of specific dates within a month to recur on */
  byMonthDay: v.nullable(
    v.array(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(31)))
  ),
  /** Set of days within a year to recur on (1-364) */
  byYearDay: v.nullable(
    v.array(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(364)))
  ),
  /** The total amount of times that the event is allowed to recur before stopping */
  count: v.nullable(v.pipe(v.number(), v.integer(), v.minValue(1)))
});

export interface ScheduledEventRecurrenceRule
  extends v.InferOutput<typeof scheduledEventRecurrenceRuleSchema> {}
