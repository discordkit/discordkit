import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  getGuildScheduledEventUsersProcedure,
  getGuildScheduledEventUsersQuery,
  getGuildScheduledEventUsersSafe,
  getGuildScheduledEventUsersSchema
} from "../getGuildScheduledEventUsers.js";
import { scheduledEventUserSchema } from "../types/ScheduledEventUser.js";

describe(`getGuildScheduledEventUsers`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/scheduled-events/:event/users`,
    pipe(array(scheduledEventUserSchema), length(1))
  );
  const config = mockSchema(getGuildScheduledEventUsersSchema);

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
