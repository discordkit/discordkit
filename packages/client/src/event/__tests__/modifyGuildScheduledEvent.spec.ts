import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyGuildScheduledEvent,
  modifyGuildScheduledEventProcedure,
  modifyGuildScheduledEventSafe,
  modifyGuildScheduledEventSchema
} from "../modifyGuildScheduledEvent.js";
import { scheduledEventSchema } from "../types/ScheduledEvent.js";

describe(`modifyGuildScheduledEvent`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/scheduled-events/:event`,
    modifyGuildScheduledEventSchema,
    scheduledEventSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyGuildScheduledEventSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildScheduledEventProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildScheduledEvent);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
