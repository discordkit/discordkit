import { describe, it, expect } from "vitest";
import {
  DISCORD_EPOCH,
  snowflakeToDate
} from "@discordkit/core/validations/snowflake";

/**
 * The payload viewer recognises values by what they mean to Discord rather
 * than by JSON type. These check the detectors directly: a false positive is
 * worse than no annotation, because a mislabelled value is actively
 * misleading — and the inspector's whole job is telling you what you received.
 *
 * Mirrors the predicates in `JsonTree.tsx`. Kept in step deliberately: they
 * are three lines each, and exporting them from a component module to share
 * with a test would be worse than the duplication.
 */
const isSnowflake = (value: string): boolean => {
  if (!/^\d{17,20}$/.test(value)) return false;
  try {
    return snowflakeToDate(value).getTime() >= Number(DISCORD_EPOCH);
  } catch {
    return false;
  }
};

const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

describe(`snowflake detection`, () => {
  it(`recognises a real Discord id and recovers its creation time`, () => {
    // A real bot id from this example's own README-era traffic.
    const id = `1157272423910084608`;
    expect(isSnowflake(id)).toBe(true);
    // The timestamp lives in the high bits, so the id alone dates the object.
    const created = snowflakeToDate(id);
    expect(created.getFullYear()).toBe(2023);
  });

  it(`rejects numeric strings that are not snowflakes`, () => {
    // The failure that matters: labelling an ordinary number as an "id" would
    // invent a creation date for something that has none.
    for (const value of [
      `0`,
      `42`,
      `1234567890`, // 10 digits — a unix timestamp, not a snowflake
      `12345678901234567890123`, // too long
      `not-a-number`,
      ``
    ]) {
      expect(isSnowflake(value)).toBe(false);
    }
  });

  it(`treats a zero-timestamp id as valid, at the epoch itself`, () => {
    // Worth pinning rather than assuming: the epoch check can never reject on
    // the low end, because the value is an OFFSET from the epoch — shifting
    // right by 22 floors at 0, so the earliest decodable time IS the epoch.
    // Only the digit-length check keeps short numeric strings out.
    expect(isSnowflake(`00000000000000001`)).toBe(true);
    expect(snowflakeToDate(`00000000000000001`).getTime()).toBe(
      Number(DISCORD_EPOCH)
    );
  });
});

/** Mirrors the numeric-timestamp branch in `JsonTree.tsx`. */
const numericToMs = (value: number): number | null =>
  value > 1_000_000_000_000 && value < 4_000_000_000_000
    ? value
    : value > 1_000_000_000 && value < 4_000_000_000
      ? value * 1000
      : null;

describe(`numeric timestamp detection`, () => {
  it(`reads milliseconds as milliseconds`, () => {
    // The ordering bug: a ms value ALSO satisfies the seconds bound, so
    // testing seconds first multiplied it again and rendered a date ~56,000
    // years in the future.
    const ms = 1_786_942_649_104;
    expect(numericToMs(ms)).toBe(ms);
  });

  it(`promotes seconds to milliseconds`, () => {
    // TYPING_START sends unix SECONDS.
    expect(numericToMs(1_786_942_649)).toBe(1_786_942_649_000);
  });

  it(`leaves ordinary numbers alone`, () => {
    // Annotating a count or a flags bitfield as a date would be worse than
    // showing nothing.
    for (const value of [0, 1, 42, 250, 1 << 20]) {
      expect(numericToMs(value)).toBeNull();
    }
  });
});

describe(`timestamp detection`, () => {
  it(`matches the ISO shapes Discord actually sends`, () => {
    for (const value of [
      `2026-08-17T19:49:04.145Z`, // message timestamps
      `2023-01-02T03:04:05Z`, // no fractional seconds
      `2026-08-17T19:49:04.145000+00:00` // offset rather than Z
    ]) {
      expect(ISO_DATE.test(value)).toBe(true);
    }
  });

  it(`does not match near-misses`, () => {
    for (const value of [
      `2026-08-17`, // date only
      `19:49:04`, // time only
      `2026-08-17 19:49:04`, // space instead of T
      `not a date`
    ]) {
      expect(ISO_DATE.test(value)).toBe(false);
    }
  });
});
