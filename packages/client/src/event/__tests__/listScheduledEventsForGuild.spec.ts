import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  listScheduledEventsForGuildProcedure,
  listScheduledEventsForGuildQuery,
  listScheduledEventsForGuildSafe,
  listScheduledEventsForGuildSchema
} from "../listScheduledEventsForGuild.js";
import { scheduledEventSchema } from "../types/ScheduledEvent.js";

describe(`listScheduledEventsForGuild`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/scheduled-events`,
    pipe(array(scheduledEventSchema), length(1))
  );
  const config = mockSchema(listScheduledEventsForGuildSchema);

  it(`can be used standalone`, async () => {
    await expect(listScheduledEventsForGuildSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listScheduledEventsForGuildProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listScheduledEventsForGuildQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
