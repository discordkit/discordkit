import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import { array, length } from "valibot";
import {
  getPinnedMessagesProcedure,
  getPinnedMessagesQuery,
  getPinnedMessagesSafe,
  getPinnedMessagesSchema
} from "../getPinnedMessages.js";
import { messageSchema } from "../types/Message.js";

describe(`getPinnedMessages`, () => {
  mockRequest.get(`/channels/:channel/pins`, array(messageSchema, [length(1)]));
  const config = mockSchema(getPinnedMessagesSchema);

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
