import { mockSchema } from "test-utils";
import { z } from "zod";
import {
  guildScheduledEventCover,
  guildScheduledEventCoverSchema
} from "../guildScheduledEventCover.js";

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
