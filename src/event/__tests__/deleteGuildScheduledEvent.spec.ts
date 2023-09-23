import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  deleteGuildScheduledEvent,
  deleteGuildScheduledEventSchema
} from "../deleteGuildScheduledEvent";

describe(`deleteGuildScheduledEvent`, () => {
  mockRequest.delete(`/guilds/:guild/scheduled-events/:event`);
  const config = generateMock(deleteGuildScheduledEventSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteGuildScheduledEvent(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteGuildScheduledEvent);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
