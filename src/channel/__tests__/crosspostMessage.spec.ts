import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { crosspostMessage, crosspostMessageSchema } from "../crosspostMessage";
import { messageSchema } from "../types/Message";

describe(`crosspostMessage`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/messages/:message/crosspost`,
    messageSchema
  );
  const config = generateMock(crosspostMessageSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.crosspostMessage(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(crosspostMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
