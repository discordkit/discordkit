import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getChannelMessagesProcedure,
  getChannelMessagesQuery,
  getChannelMessagesSafe,
  getChannelMessagesSchema
} from "../getChannelMessages.ts";
import { messageSchema } from "../types/Message.ts";

describe(`getChannelMessages`, () => {
  mockRequest.get(
    `/channels/:channel/messages`,
    messageSchema.array().length(1)
  );
  const config = mockSchema(getChannelMessagesSchema);

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
