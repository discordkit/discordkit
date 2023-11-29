import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import { array, length } from "valibot";
import {
  getGuildWebhooksProcedure,
  getGuildWebhooksQuery,
  getGuildWebhooksSafe,
  getGuildWebhooksSchema
} from "../getGuildWebhooks.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`getGuildWebhooks`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/webhooks`,
    array(webhookSchema, [length(1)])
  );
  const config = mockSchema(getGuildWebhooksSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildWebhooksSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildWebhooksProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildWebhooksQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
