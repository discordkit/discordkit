import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  modifyGuildScheduledEvent,
  modifyGuildScheduledEventProcedure,
  modifyGuildScheduledEventSafe,
  modifyGuildScheduledEventSchema
} from "../modifyGuildScheduledEvent.ts";
import { scheduledEventSchema } from "../types/ScheduledEvent.ts";

describe(`modifyGuildScheduledEvent`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/scheduled-events/:event`,
    scheduledEventSchema
  );
  const config = generateMock(modifyGuildScheduledEventSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildScheduledEventSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildScheduledEventProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildScheduledEvent);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
