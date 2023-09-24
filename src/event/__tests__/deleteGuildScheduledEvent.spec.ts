import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteGuildScheduledEvent,
  deleteGuildScheduledEventProcedure,
  deleteGuildScheduledEventSchema
} from "../deleteGuildScheduledEvent";

describe(`deleteGuildScheduledEvent`, () => {
  mockRequest.delete(`/guilds/:guild/scheduled-events/:event`);
  const config = generateMock(deleteGuildScheduledEventSchema);

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
