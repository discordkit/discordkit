import { mockSchema } from "#test-utils";
import { parse, pipe, string, url } from "valibot";
import {
  guildScheduledEventCover,
  guildScheduledEventCoverSchema
} from "../guildScheduledEventCover.js";

describe(`guildScheduledEventCover`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        guildScheduledEventCover(mockSchema(guildScheduledEventCoverSchema))
      )
    ).not.toThrow();
  });
});
