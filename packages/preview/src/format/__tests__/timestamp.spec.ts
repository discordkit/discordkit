import { afterEach, describe, expect, it } from "vite-plus/test";
import type { TimestampStyle } from "../../markdown/ast.js";
import {
  formatHeaderTime,
  formatMessageTime,
  formatTimestamp,
  resolveClock
} from "../timestamp.js";

/**
 * A preview is only useful if `<t:…>` shows what the channel will see, and the same scene must show it on every machine. So every case pins the clock, zone and locale, and the zone-independence case changes the machine's own zone under the formatter to prove it is never read.
 *
 * The moment is the one in Discord's message-formatting reference: Tuesday, April 20, 2021 at 16:20:30 UTC.
 */
const moment = Date.UTC(2021, 3, 20, 16, 20, 30) / 1000;

const clockAt = (
  now: string,
  timeZone = `UTC`,
  locale = `en-US`
): ReturnType<typeof resolveClock> => resolveClock({ now, timeZone, locale });

/** An hour and a half after the moment, so the relative style has something to say. */
const later = clockAt(`2021-04-20T17:50:30Z`);

describe(`formatTimestamp`, () => {
  it.each<[TimestampStyle, string]>([
    [`t`, `4:20 PM`],
    [`T`, `4:20:30 PM`],
    [`d`, `04/20/2021`],
    [`D`, `April 20, 2021`],
    [`f`, `April 20, 2021 at 4:20 PM`],
    [`F`, `Tuesday, April 20, 2021 at 4:20 PM`],
    [`s`, `04/20/2021, 4:20 PM`],
    [`S`, `04/20/2021, 4:20:30 PM`],
    [`R`, `1 hour ago`]
  ])(
    `writes style %s the way Discord's reference shows it, for an en-US viewer in UTC`,
    (style, expected) => {
      expect(formatTimestamp(moment, style, later)).toBe(expected);
    }
  );

  it.each<[TimestampStyle, string]>([
    [`t`, `16:20`],
    [`T`, `16:20:30`],
    [`d`, `20/04/2021`],
    [`s`, `20/04/2021, 16:20`],
    [`S`, `20/04/2021, 16:20:30`]
  ])(
    `writes style %s in the viewer's locale, so an en-GB viewer gets the reference's day-first, 24-hour form`,
    (style, expected) => {
      const clock = clockAt(`2021-04-20T17:50:30Z`, `UTC`, `en-GB`);
      expect(formatTimestamp(moment, style, clock)).toBe(expected);
    }
  );

  it(`writes the time in the viewer's zone, not UTC: the same moment is 12:20 PM in New York`, () => {
    const clock = clockAt(`2021-04-20T17:50:30Z`, `America/New_York`);
    expect(formatTimestamp(moment, `t`, clock)).toBe(`12:20 PM`);
    expect(formatTimestamp(moment, `F`, clock)).toBe(
      `Tuesday, April 20, 2021 at 12:20 PM`
    );
  });

  it(`moves to the next calendar day when the viewer's zone has already passed midnight`, () => {
    const clock = clockAt(`2021-04-20T17:50:30Z`, `Asia/Tokyo`, `en-US`);
    expect(formatTimestamp(moment, `d`, clock)).toBe(`04/21/2021`);
  });

  describe(`the relative style`, () => {
    const at = clockAt(`2021-04-20T16:20:30Z`);

    it.each([
      [45, `in 45 seconds`],
      [59, `in 59 seconds`],
      [60, `in 1 minute`],
      [3599, `in 59 minutes`],
      [3600, `in 1 hour`],
      [86_400, `in 1 day`],
      [30 * 86_400, `in 1 month`],
      [365 * 86_400, `in 1 year`],
      [-45, `45 seconds ago`],
      [-7200, `2 hours ago`]
    ])(
      `measures from the scene's clock, not the machine's: %i seconds away reads %j`,
      (offset, expected) => {
        expect(formatTimestamp(moment + offset, `R`, at)).toBe(expected);
      }
    );

    it(`counts whole units, so a countdown with 59 minutes left never claims an hour`, () => {
      expect(formatTimestamp(moment + 3599, `R`, at)).toBe(`in 59 minutes`);
    });
  });

  it(`returns undefined for a time no date can hold, so the caller can show what was written`, () => {
    expect(formatTimestamp(9e15, `f`, later)).toBeUndefined();
  });

  describe(`on a machine in another time zone`, () => {
    const original = process.env.TZ;
    afterEach(() => {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    });

    it(`gives the same text, because the machine's zone is never read`, () => {
      const styles: TimestampStyle[] = [
        `t`,
        `T`,
        `d`,
        `D`,
        `f`,
        `F`,
        `s`,
        `S`,
        `R`
      ];
      const inUtc = styles.map((style) =>
        formatTimestamp(moment, style, later)
      );
      // Node re-reads TZ when it is assigned, so local-time APIs answer in Auckland from here on. The formatter must not notice.
      process.env.TZ = `Pacific/Auckland`;
      expect(new Date(moment * 1000).getHours()).not.toBe(16);
      expect(
        styles.map((style) => formatTimestamp(moment, style, later))
      ).toStrictEqual(inUtc);
      expect(formatMessageTime(moment * 1000, later)).toBe(`Today at 4:20 PM`);
    });
  });
});

describe(`formatHeaderTime`, () => {
  it(`writes only the time for a message sent on the viewer's current day, as every desktop capture of a header shows`, () => {
    expect(formatHeaderTime(moment * 1000, later)).toBe(`4:20 PM`);
  });

  it(`decides "today" in the viewer's zone: in Tokyo the moment is already the next day`, () => {
    const clock = clockAt(`2021-04-21T03:00:00Z`, `Asia/Tokyo`);
    expect(formatHeaderTime(moment * 1000, clock)).toBe(`1:20 AM`);
  });

  it(`writes a short date and the time for an older message, as the iOS app does (no desktop capture shows one)`, () => {
    const clock = clockAt(`2021-04-25T12:00:00Z`);
    expect(formatHeaderTime(moment * 1000, clock)).toBe(`4/20/21, 4:20 PM`);
  });

  it(`says "Yesterday at" for the day before (unobserved)`, () => {
    const clock = clockAt(`2021-04-21T00:30:00Z`);
    expect(formatHeaderTime(moment * 1000, clock)).toBe(`Yesterday at 4:20 PM`);
  });
});

describe(`formatMessageTime, an embed footer's time`, () => {
  it(`says "Today at" for a message sent on the viewer's current day`, () => {
    expect(formatMessageTime(moment * 1000, later)).toBe(`Today at 4:20 PM`);
  });

  it(`says "Yesterday at" for the day before, by the viewer's calendar rather than 24 hours`, () => {
    // Just after midnight in UTC: the moment was eight hours ago, but on the previous day.
    const clock = clockAt(`2021-04-21T00:30:00Z`);
    expect(formatMessageTime(moment * 1000, clock)).toBe(
      `Yesterday at 4:20 PM`
    );
  });

  it(`writes the date and time for anything older`, () => {
    const clock = clockAt(`2021-04-25T12:00:00Z`);
    expect(formatMessageTime(moment * 1000, clock)).toBe(`04/20/2021 4:20 PM`);
  });

  it(`decides the day in the viewer's zone: in Tokyo the moment is already the next day, so "today" there is a different date`, () => {
    const clock = clockAt(`2021-04-21T03:00:00Z`, `Asia/Tokyo`);
    expect(formatMessageTime(moment * 1000, clock)).toBe(`Today at 1:20 AM`);
  });
});

describe(`resolveClock`, () => {
  it(`fills in a fixed clock, UTC and en-US, so a scene that names none still renders the same every time`, () => {
    expect(resolveClock({})).toStrictEqual({
      now: Date.parse(`2026-01-01T12:00:00.000Z`),
      timeZone: `UTC`,
      locale: `en-US`
    });
  });

  it.each([
    [{ now: `yesterday` }, /could not read the scene's `now`/],
    [{ timeZone: `Mars/Olympus` }, /does not recognise the scene's `timeZone`/],
    [{ locale: `not a locale!` }, /does not recognise the scene's `locale`/]
  ])(
    `refuses %j with a message naming the field and how to write it`,
    (scene, message) => {
      expect(() => resolveClock(scene)).toThrow(message);
    }
  );
});
