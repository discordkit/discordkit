import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteGuildScheduledEvent,
  deleteGuildScheduledEventProcedure,
  deleteGuildScheduledEventSafe,
  deleteGuildScheduledEventSchema
} from "../deleteGuildScheduledEvent.js";

describe(`deleteGuildScheduledEvent`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/scheduled-events/:event`,
    deleteGuildScheduledEventSchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteGuildScheduledEventSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGuildScheduledEventProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGuildScheduledEvent);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
