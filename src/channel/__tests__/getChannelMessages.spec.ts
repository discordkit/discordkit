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
  getChannelMessagesSafe,
  getChannelMessagesSchema
} from "../getChannelMessages";
import { messageSchema } from "../types/Message";

describe(`getChannelMessages`, () => {
  mockRequest.get(`/channels/:channel/messages`, messageSchema.array());
  const config = generateMock(getChannelMessagesSchema);

  it(`can be used standalone`, async () => {
    await expect(getChannelMessagesSafe(config)).resolves.toBeDefined();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getChannelMessagesProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getChannelMessagesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
