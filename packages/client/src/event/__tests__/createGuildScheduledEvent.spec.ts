import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createGuildScheduledEvent,
  createGuildScheduledEventProcedure,
  createGuildScheduledEventSafe,
  createGuildScheduledEventSchema
} from "../createGuildScheduledEvent.ts";
import { scheduledEventSchema } from "../types/ScheduledEvent.ts";

describe(`createGuildScheduledEvent`, () => {
  const expected = mockRequest.post(
    `/guilds/:guild/scheduled-events`,
    scheduledEventSchema
  );
  const config = mockSchema(createGuildScheduledEventSchema);

  it(`can be used standalone`, async () => {
    await expect(createGuildScheduledEventSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

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
