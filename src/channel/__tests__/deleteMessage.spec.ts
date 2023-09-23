import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { deleteMessage, deleteMessageSchema } from "../deleteMessage";

describe(`deleteMessage`, () => {
  mockRequest.delete(`/channels/:channel/messages/:message`);
  const config = generateMock(deleteMessageSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteMessage(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
