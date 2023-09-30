import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  listScheduledEventsForGuildProcedure,
  listScheduledEventsForGuildQuery,
  listScheduledEventsForGuildSafe,
  listScheduledEventsForGuildSchema
} from "../listScheduledEventsForGuild";
import { scheduledEventSchema } from "../types/ScheduledEvent";

describe(`listScheduledEventsForGuild`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/scheduled-events`,
    scheduledEventSchema.array()
  );
  const config = generateMock(listScheduledEventsForGuildSchema);

  it(`can be used standalone`, async () => {
    await expect(
      listScheduledEventsForGuildSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listScheduledEventsForGuildProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listScheduledEventsForGuildQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
