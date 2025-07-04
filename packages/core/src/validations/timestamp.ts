import * as v from "valibot";

/** An [ISO8601](https://www.loc.gov/standards/datetime/iso-tc154-wg5_n0038_iso_wd_8601-1_2016-02-16.pdf) timestamp */
export const timestamp = v.message(
  v.pipe(v.string(), v.isoTimestamp()),
  (issue) => `Expected a valid timestamp, received: ${issue.received}`
) as v.GenericSchema<string>;
