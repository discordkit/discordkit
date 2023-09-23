import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  listScheduledEventsForGuildQuery,
  listScheduledEventsForGuildSchema
} from "../listScheduledEventsForGuild";
import { scheduledEventSchema } from "../types";

describe(`listScheduledEventsForGuild`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/scheduled-events`,
    scheduledEventSchema.array()
  );
  const config = generateMock(listScheduledEventsForGuildSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.listScheduledEventsForGuild(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(listScheduledEventsForGuildQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
