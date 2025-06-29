import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getWebhookMessageProcedure,
  getWebhookMessageQuery,
  getWebhookMessageSafe,
  getWebhookMessageSchema
} from "../getWebhookMessage.js";
import { messageSchema } from "../../messages/types/Message.js";

describe(`getWebhookMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/webhooks/:webhook/:token/messages/:message`,
    getWebhookMessageSchema,
    messageSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getWebhookMessageSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getWebhookMessageProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getWebhookMessageQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
