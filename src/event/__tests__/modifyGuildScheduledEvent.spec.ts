import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  modifyGuildScheduledEvent,
  modifyGuildScheduledEventSchema
} from "../modifyGuildScheduledEvent";
import { scheduledEventSchema } from "../types";

describe(`modifyGuildScheduledEvent`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/scheduled-events/:event`,
    scheduledEventSchema
  );
  const config = generateMock(modifyGuildScheduledEventSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyGuildScheduledEvent(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyGuildScheduledEvent);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
