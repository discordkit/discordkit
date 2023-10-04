import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  deleteGuildScheduledEvent,
  deleteGuildScheduledEventProcedure,
  deleteGuildScheduledEventSafe,
  deleteGuildScheduledEventSchema
} from "../deleteGuildScheduledEvent.js";

describe(`deleteGuildScheduledEvent`, () => {
  mockRequest.delete(`/guilds/:guild/scheduled-events/:event`);
  const config = mockSchema(deleteGuildScheduledEventSchema);

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
