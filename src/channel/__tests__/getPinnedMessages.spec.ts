import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getPinnedMessagesQuery,
  getPinnedMessagesSchema
} from "../getPinnedMessages";
import { messageSchema } from "../types/Message";

describe(`getPinnedMessages`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/pins`,
    messageSchema.array()
  );
  const config = generateMock(getPinnedMessagesSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getPinnedMessages(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getPinnedMessagesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
