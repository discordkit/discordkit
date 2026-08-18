import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import { gatewayBotResponseSchema } from "../types/GatewayBotResponse.js";
import { getGatewayBot } from "../getGatewayBot.js";

describe(`getGatewayBot`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/gateway/bot`,
    null,
    gatewayBotResponseSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getGatewayBot, null, gatewayBotResponseSchema)()
    ).resolves.toEqual(expected);
  });
});
