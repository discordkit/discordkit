import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { webhookSchema } from "../types/Webhook.js";
import {
  getGuildWebhooksSchema,
  getGuildWebhooks
} from "../getGuildWebhooks.js";

describe(`getGuildWebhooks`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/webhooks`,
    getGuildWebhooksSchema,
    v.pipe(v.array(webhookSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildWebhooks,
        getGuildWebhooksSchema,
        v.pipe(v.array(webhookSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
