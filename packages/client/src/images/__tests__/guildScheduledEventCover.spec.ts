import { mockUtils } from "#mocks";
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
        guildScheduledEventCover(
          mockUtils.schema(guildScheduledEventCoverSchema)
        )
      )
    ).not.toThrow();
  });
});
