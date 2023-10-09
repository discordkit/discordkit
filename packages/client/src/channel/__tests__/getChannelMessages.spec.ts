import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import { array, length } from "valibot";
import {
  getChannelMessagesProcedure,
  getChannelMessagesQuery,
  getChannelMessagesSafe,
  getChannelMessagesSchema
} from "../getChannelMessages.js";
import { messageSchema } from "../types/Message.js";

describe(`getChannelMessages`, () => {
  mockRequest.get(
    `/channels/:channel/messages`,
    array(messageSchema, [length(1)])
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
