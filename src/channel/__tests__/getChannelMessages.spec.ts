import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getChannelMessagesProcedure,
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
    await expect(
      runProcedure(getChannelMessagesProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getChannelMessagesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
