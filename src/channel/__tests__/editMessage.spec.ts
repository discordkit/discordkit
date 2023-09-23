import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { editMessage, editMessageSchema } from "../editMessage";
import { messageSchema } from "../types/Message";

describe(`editMessage`, () => {
  const expected = mockRequest.patch(
    `/channels/:channel/messages/:message`,
    messageSchema
  );
  const config = generateMock(editMessageSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.editMessage(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(editMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
