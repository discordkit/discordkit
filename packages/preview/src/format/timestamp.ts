import type { TimestampStyle } from "../markdown/ast.js";
import {
  defaultLocale,
  defaultNow,
  defaultTimeZone,
  type Scene
} from "../scene.js";

/**
 * Dates and times as Discord writes them, measured against a scene's own clock, zone and locale. Nothing here reads the machine's clock, zone or locale: every `Intl` call is given all three, so a scene renders the same text on any machine.
 *
 * The per-style formats follow the examples in Discord's message-formatting reference (`t` 16:20, `T` 16:20:30, `d` 20/04/2021, `D` April 20, 2021, `f` April 20, 2021 at 16:20, `F` Tuesday, April 20, 2021 at 16:20, `s` 20/04/2021, 16:20, `S` 20/04/2021, 16:20:30, `R` 4 years ago), written in the viewer's locale by `Intl`. The client decides these in JavaScript, so the exact output per locale, and the relative style's units and rounding, are unverified until calibration.
 */

/** A scene's clock, checked and ready to format against. */
export interface Clock {
  /** Milliseconds since the epoch. */
  readonly now: number;
  readonly timeZone: string;
  readonly locale: string;
}

/** Checks a scene's `now`, `timeZone` and `locale`, filling in the defaults, and throws a message that names the bad field. */
export const resolveClock = ({
  now = defaultNow,
  timeZone = defaultTimeZone,
  locale = defaultLocale
}: Pick<Scene, `now` | `timeZone` | `locale`>): Clock => {
  const ms = Date.parse(now);
  if (Number.isNaN(ms)) {
    throw new Error(
      `@discordkit/preview could not read the scene's \`now\` (${JSON.stringify(now)}) as a date. It is the clock that relative timestamps and the day in each message header are measured from, so it has to be an ISO 8601 date-time. Write it like "2026-11-25T16:05:00Z".`
    );
  }
  try {
    new Intl.DateTimeFormat(defaultLocale, { timeZone });
  } catch (error) {
    throw new Error(
      `@discordkit/preview does not recognise the scene's \`timeZone\` (${JSON.stringify(timeZone)}). It sets the zone the viewer reads times in, and has to be an IANA time zone name. Use one like "UTC", "America/New_York" or "Asia/Tokyo".`,
      { cause: error }
    );
  }
  let canonical: string;
  try {
    [canonical = defaultLocale] = Intl.getCanonicalLocales(locale);
  } catch (error) {
    throw new Error(
      `@discordkit/preview does not recognise the scene's \`locale\` (${JSON.stringify(locale)}). It sets the viewer's Discord language, and has to be a BCP 47 language tag. Use one like "en-US", "en-GB" or "ja".`,
      { cause: error }
    );
  }
  return { now: ms, timeZone, locale: canonical };
};

const timeOptions = {
  short: { hour: `numeric`, minute: `2-digit` },
  medium: { hour: `numeric`, minute: `2-digit`, second: `2-digit` }
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

/** Day, month and four-digit year, all numeric: the reference's `20/04/2021`. */
const shortDate = {
  year: `numeric`,
  month: `2-digit`,
  day: `2-digit`
} as const satisfies Intl.DateTimeFormatOptions;

const styleOptions = {
  t: timeOptions.short,
  T: timeOptions.medium,
  d: shortDate,
  D: { dateStyle: `long` },
  f: { dateStyle: `long`, timeStyle: `short` },
  F: { dateStyle: `full`, timeStyle: `short` },
  s: { ...shortDate, ...timeOptions.short },
  S: { ...shortDate, ...timeOptions.medium }
} as const satisfies Record<
  Exclude<TimestampStyle, `R`>,
  Intl.DateTimeFormatOptions
>;

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;

/** Largest unit first. A month is 30 days and a year 365; the relative style counts whole units, rounding toward zero. */
const relativeUnits: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  [`year`, 365 * day],
  [`month`, 30 * day],
  [`day`, day],
  [`hour`, hour],
  [`minute`, minute],
  [`second`, second]
];

const relative = (ms: number, clock: Clock): string => {
  const diff = ms - clock.now;
  const [unit, size] = relativeUnits.find(
    ([, unitSize]) => Math.abs(diff) >= unitSize
  ) ?? [`second`, second];
  return new Intl.RelativeTimeFormat(clock.locale, {
    numeric: `always`
  }).format(Math.trunc(diff / size), unit);
};

/** The range a JavaScript date can hold, in milliseconds either side of the epoch. */
const maxDate = 8.64e15;

/**
 * How Discord shows `<t:seconds:style>` to a viewer at `clock`, or `undefined` when the time is outside the range a date can hold.
 *
 * @example
 * formatTimestamp(1618935600, `f`, clock); // "April 20, 2021 at 4:20 PM" for en-US in UTC
 */
export const formatTimestamp = (
  seconds: number,
  style: TimestampStyle,
  clock: Clock
): string | undefined => {
  const ms = seconds * 1000;
  if (!Number.isFinite(ms) || Math.abs(ms) > maxDate) return undefined;
  if (style === `R`) return relative(ms, clock);
  return new Intl.DateTimeFormat(clock.locale, {
    ...styleOptions[style],
    timeZone: clock.timeZone
  }).format(ms);
};

/** The calendar day a moment falls on in `timeZone`, as a count of days since the epoch, so two moments can be compared by day. */
const dayNumber = (ms: number, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat(`en-US`, {
    timeZone,
    year: `numeric`,
    month: `numeric`,
    day: `numeric`
  }).formatToParts(ms);
  const part = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((entry) => entry.type === type)?.value);
  return Date.UTC(part(`year`), part(`month`) - 1, part(`day`)) / day;
};

/**
 * The time in a message header, as the desktop client writes it.
 *
 * - Sent on the viewer's current day: the time alone, "4:05 PM". Seen in every desktop capture of a header (spec §7b).
 * - The day before: "Yesterday at 4:05 PM". Not seen in any capture; kept from what an embed's footer says.
 * - Anything older or newer: a short date and the time, "4/20/21, 4:05 PM". Seen only in the iOS app; the desktop header for an older message has not been captured.
 *
 * The word "Yesterday" is English whatever the locale; the time and date follow the locale.
 */
export const formatHeaderTime = (ms: number, clock: Clock): string => {
  const days =
    dayNumber(clock.now, clock.timeZone) - dayNumber(ms, clock.timeZone);
  if (days === 1) return formatMessageTime(ms, clock);
  return new Intl.DateTimeFormat(clock.locale, {
    ...(days === 0 ? {} : { dateStyle: `short` }),
    timeStyle: `short`,
    timeZone: clock.timeZone
  }).format(ms);
};

/**
 * The time in an embed's footer: "Today at 4:05 PM", "Yesterday at 4:05 PM", or the date and time for anything older or newer. None of these has been seen in a capture. The words are English whatever the locale, which is only right for English locales; the time and date follow the locale.
 */
export const formatMessageTime = (ms: number, clock: Clock): string => {
  const time = new Intl.DateTimeFormat(clock.locale, {
    ...timeOptions.short,
    timeZone: clock.timeZone
  }).format(ms);
  const days =
    dayNumber(clock.now, clock.timeZone) - dayNumber(ms, clock.timeZone);
  if (days === 0) return `Today at ${time}`;
  if (days === 1) return `Yesterday at ${time}`;
  const date = new Intl.DateTimeFormat(clock.locale, {
    ...shortDate,
    timeZone: clock.timeZone
  }).format(ms);
  return `${date} ${time}`;
};
