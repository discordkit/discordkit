import { mockSchema } from "#test-utils";
import { parse, string, url } from "valibot";
import {
  guildScheduledEventCover,
  guildScheduledEventCoverSchema
} from "../guildScheduledEventCover.js";

describe(`guildScheduledEventCover`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        string([url()]),
        guildScheduledEventCover(mockSchema(guildScheduledEventCoverSchema))
      )
    ).not.toThrow();
  });
});
