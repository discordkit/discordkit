import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getFollowupMessageProcedure,
  getFollowupMessageQuery,
  getFollowupMessageSafe,
  getFollowupMessageSchema
} from "../getFollowupMessage.js";
import { messageSchema } from "../../channel/types/Message.js";

describe(`getFollowupMessage`, () => {
  mockRequest.get(
    `/webhooks/:application/:token/messages/:message`,
    messageSchema
  );
  const config = mockSchema(getFollowupMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(getFollowupMessageSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getFollowupMessageProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getFollowupMessageQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
