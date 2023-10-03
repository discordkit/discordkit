import { mockSchema } from "test-utils";
import {
  guildScheduledEventCover,
  guildScheduledEventCoverSchema
} from "../guildScheduledEventCover.ts";
import { z } from "zod";

describe(`guildScheduledEventCover`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(
          guildScheduledEventCover(mockSchema(guildScheduledEventCoverSchema))
        )
    ).not.toThrow();
  });
});
