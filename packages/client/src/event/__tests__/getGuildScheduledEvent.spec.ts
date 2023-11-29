import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildScheduledEventProcedure,
  getGuildScheduledEventQuery,
  getGuildScheduledEventSafe,
  getGuildScheduledEventSchema
} from "../getGuildScheduledEvent.js";
import { scheduledEventSchema } from "../types/ScheduledEvent.js";

describe(`getGuildScheduledEvent`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/scheduled-events/:event`,
    scheduledEventSchema
  );
  const config = mockSchema(getGuildScheduledEventSchema);

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
