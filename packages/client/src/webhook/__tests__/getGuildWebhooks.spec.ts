import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  getGuildWebhooksProcedure,
  getGuildWebhooksQuery,
  getGuildWebhooksSafe,
  getGuildWebhooksSchema
} from "../getGuildWebhooks.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`getGuildWebhooks`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/webhooks`,
    getGuildWebhooksSchema,
    pipe(array(webhookSchema), length(1))
  );

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
