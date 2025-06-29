import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  getGuildScheduledEventUsersProcedure,
  getGuildScheduledEventUsersQuery,
  getGuildScheduledEventUsersSafe,
  getGuildScheduledEventUsersSchema
} from "../getGuildScheduledEventUsers.js";
import { scheduledEventUserSchema } from "../types/ScheduledEventUser.js";

describe(`getGuildScheduledEventUsers`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/scheduled-events/:event/users`,
    getGuildScheduledEventUsersSchema,
    pipe(array(scheduledEventUserSchema), length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildScheduledEventUsersSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildScheduledEventUsersProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildScheduledEventUsersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
