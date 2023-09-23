import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { createMessage, createMessageSchema } from "../createMessage";
import { messageSchema } from "../types/Message";

describe(`createMessage`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/messages`,
    messageSchema
  );
  const config = generateMock(createMessageSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createMessage(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
