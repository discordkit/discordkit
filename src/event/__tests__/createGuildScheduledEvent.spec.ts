import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createGuildScheduledEvent,
  createGuildScheduledEventProcedure,
  createGuildScheduledEventSchema
} from "../createGuildScheduledEvent";
import { scheduledEventSchema } from "../types/ScheduledEvent";

describe(`createGuildScheduledEvent`, () => {
  const expected = mockRequest.post(
    `/guilds/:guild/scheduled-events`,
    scheduledEventSchema
  );
  const config = generateMock(createGuildScheduledEventSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildScheduledEventProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildScheduledEvent);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});