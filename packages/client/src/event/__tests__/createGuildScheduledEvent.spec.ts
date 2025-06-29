import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createGuildScheduledEvent,
  createGuildScheduledEventProcedure,
  createGuildScheduledEventSafe,
  createGuildScheduledEventSchema
} from "../createGuildScheduledEvent.js";
import { scheduledEventSchema } from "../types/ScheduledEvent.js";

describe(`createGuildScheduledEvent`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/scheduled-events`,
    createGuildScheduledEventSchema,
    scheduledEventSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createGuildScheduledEventSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildScheduledEventProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildScheduledEvent);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
