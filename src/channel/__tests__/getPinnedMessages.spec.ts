import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getPinnedMessagesProcedure,
  getPinnedMessagesQuery,
  getPinnedMessagesSchema
} from "../getPinnedMessages";
import { messageSchema } from "../types/Message";

describe(`getPinnedMessages`, () => {
  mockRequest.get(`/channels/:channel/pins`, messageSchema.array());
  const config = generateMock(getPinnedMessagesSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getPinnedMessagesProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getPinnedMessagesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
