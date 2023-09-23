import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getGuildScheduledEventUsersQuery,
  getGuildScheduledEventUsersSchema
} from "../getGuildScheduledEventUsers";
import { scheduledEventUserSchema } from "../types";

describe(`getGuildScheduledEventUsers`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/scheduled-events/:event/users`,
    scheduledEventUserSchema.array()
  );
  const config = generateMock(getGuildScheduledEventUsersSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildScheduledEventUsers(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildScheduledEventUsersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
