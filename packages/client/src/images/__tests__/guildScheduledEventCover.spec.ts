import * as v from "valibot";
import { mockUtils } from "#mocks";
import {
  guildScheduledEventCover,
  guildScheduledEventCoverSchema
} from "../guildScheduledEventCover.js";

describe(`guildScheduledEventCover`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        guildScheduledEventCover(
          mockUtils.schema(guildScheduledEventCoverSchema)
        )
      )
    ).not.toThrow();
  });
});
