import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import {
  getChannelMessageProcedure,
  getChannelMessageQuery,
  getChannelMessageSafe,
  getChannelMessageSchema
} from "../getChannelMessage.js";
import { messageSchema } from "../types/Message.js";

describe(`getChannelMessage`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/messages/:message`,
    messageSchema
  );
  const config = mockSchema(getChannelMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(getChannelMessageSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getChannelMessageProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getChannelMessageQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
