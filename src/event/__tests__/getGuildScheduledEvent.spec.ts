import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { scheduledEventSchema } from "../types";
import {
  getGuildScheduledEventQuery,
  getGuildScheduledEventSchema
} from "../getGuildScheduledEvent";

describe(`getGuildScheduledEvent`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/scheduled-events/:event`,
    scheduledEventSchema
  );
  const config = generateMock(getGuildScheduledEventSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildScheduledEvent(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildScheduledEventQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
