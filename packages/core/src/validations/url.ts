import * as v from "valibot";

export const url: v.GenericSchema<string> = v.message(
  v.pipe(v.string(), v.url()),
  (issue) => `Expected a valid URL, received: ${issue.received}`
);
