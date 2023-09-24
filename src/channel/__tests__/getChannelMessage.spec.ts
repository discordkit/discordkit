import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getChannelMessageProcedure,
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
    await expect(
      runProcedure(getChannelMessageProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getChannelMessageQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
