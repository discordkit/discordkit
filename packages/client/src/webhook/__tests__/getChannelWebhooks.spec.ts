import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { webhookSchema } from "../types/Webhook.js";
import {
  getChannelWebhooksSchema,
  getChannelWebhooks
} from "../getChannelWebhooks.js";

describe(`getChannelWebhooks`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/webhooks`,
    getChannelWebhooksSchema,
    v.pipe(v.array(webhookSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getChannelWebhooks,
        getChannelWebhooksSchema,
        v.pipe(v.array(webhookSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
