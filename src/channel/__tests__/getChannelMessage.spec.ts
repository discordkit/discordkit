import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getChannelMessageQuery,
  getChannelMessageSchema
} from "../getChannelMessage";
import { messageSchema } from "../types/Message";

describe(`getChannelMessage`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/messages/:message`,
    messageSchema
  );
  const config = generateMock(getChannelMessageSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getChannelMessage(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getChannelMessageQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
