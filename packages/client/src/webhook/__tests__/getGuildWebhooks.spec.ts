import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { webhookSchema } from "../types/Webhook.js";
import {
  getGuildWebhooksProcedure,
  getGuildWebhooksQuery,
  getGuildWebhooksSafe,
  getGuildWebhooksSchema
} from "../getGuildWebhooks.js";

describe(`getGuildWebhooks`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/webhooks`,
    getGuildWebhooksSchema,
    v.pipe(v.array(webhookSchema), v.length(1))
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
