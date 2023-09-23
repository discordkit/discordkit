import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { scheduledEventSchema } from "../types";
import {
  createGuildScheduledEvent,
  createGuildScheduledEventSchema
} from "../createGuildScheduledEvent";

describe(`createGuildScheduledEvent`, () => {
  const expected = mockRequest.post(
    `/guilds/:guild/scheduled-events`,
    scheduledEventSchema
  );
  const config = generateMock(createGuildScheduledEventSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createGuildScheduledEvent(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createGuildScheduledEvent);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
