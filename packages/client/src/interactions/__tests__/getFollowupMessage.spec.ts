import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getFollowupMessageProcedure,
  getFollowupMessageQuery,
  getFollowupMessageSafe,
  getFollowupMessageSchema
} from "../getFollowupMessage.js";
import { messageSchema } from "../../messages/types/Message.js";

describe(`getFollowupMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.get(
    `/webhooks/:application/:token/messages/:message`,
    getFollowupMessageSchema,
    messageSchema
  );

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
