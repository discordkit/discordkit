import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { scheduledEventSchema } from "../types/ScheduledEvent.js";
import {
  listScheduledEventsForGuildProcedure,
  listScheduledEventsForGuildQuery,
  listScheduledEventsForGuildSafe,
  listScheduledEventsForGuildSchema
} from "../listScheduledEventsForGuild.js";

describe(`listScheduledEventsForGuild`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/scheduled-events`,
    listScheduledEventsForGuildSchema,
    v.pipe(v.array(scheduledEventSchema), v.length(1))
  );

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
