import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  editWebhookMessage,
  editWebhookMessageProcedure,
  editWebhookMessageSafe,
  editWebhookMessageSchema
} from "../editWebhookMessage.js";
import { messageSchema } from "../../messages/types/Message.js";

describe(`editWebhookMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/webhooks/:webhook/:token/messages/:message`,
    editWebhookMessageSchema,
    messageSchema
  );

  it(`can be used standalone`, async () => {
    await expect(editWebhookMessageSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editWebhookMessageProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editWebhookMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
