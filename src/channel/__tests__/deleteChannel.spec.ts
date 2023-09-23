import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { deleteChannel, deleteChannelSchema } from "../deleteChannel";

describe(`deleteChannel`, () => {
  mockRequest.delete(`/channels/:channel`);
  const config = generateMock(deleteChannelSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteChannel(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
