import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGuildScheduledEventProcedure,
  getGuildScheduledEventQuery,
  getGuildScheduledEventSafe,
  getGuildScheduledEventSchema
} from "../getGuildScheduledEvent.js";
import { scheduledEventSchema } from "../types/ScheduledEvent.js";

describe(`getGuildScheduledEvent`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/scheduled-events/:event`,
    getGuildScheduledEventSchema,
    scheduledEventSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildScheduledEventSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildScheduledEventProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildScheduledEventQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
