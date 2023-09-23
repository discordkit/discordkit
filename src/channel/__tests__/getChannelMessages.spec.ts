import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getChannelMessagesQuery,
  getChannelMessagesSchema
} from "../getChannelMessages";
import { messageSchema } from "../types/Message";

describe(`getChannelMessages`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/messages`,
    messageSchema.array()
  );
  const config = generateMock(getChannelMessagesSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getChannelMessages(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getChannelMessagesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
