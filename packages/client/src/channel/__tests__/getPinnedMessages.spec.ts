import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getPinnedMessagesProcedure,
  getPinnedMessagesQuery,
  getPinnedMessagesSafe,
  getPinnedMessagesSchema
} from "../getPinnedMessages.ts";
import { messageSchema } from "../types/Message.ts";

describe(`getPinnedMessages`, () => {
  mockRequest.get(`/channels/:channel/pins`, messageSchema.array().length(1));
  const config = generateMock(getPinnedMessagesSchema);

  it(`can be used standalone`, async () => {
    await expect(getPinnedMessagesSafe(config)).resolves.toBeDefined();
  });

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
