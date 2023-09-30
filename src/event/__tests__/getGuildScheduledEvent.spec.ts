import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildScheduledEventProcedure,
  getGuildScheduledEventQuery,
  getGuildScheduledEventSafe,
  getGuildScheduledEventSchema
} from "../getGuildScheduledEvent";
import { scheduledEventSchema } from "../types/ScheduledEvent";

describe(`getGuildScheduledEvent`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/scheduled-events/:event`,
    scheduledEventSchema
  );
  const config = generateMock(getGuildScheduledEventSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildScheduledEventSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildScheduledEventProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildScheduledEventQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
