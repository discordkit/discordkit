import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import { gatewayResponseSchema } from "../types/GatewayResponse.js";
import { getGateway } from "../getGateway.js";

describe(`getGateway`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/gateway`,
    null,
    gatewayResponseSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getGateway, null, gatewayResponseSchema)()
    ).resolves.toEqual(expected);
  });
});
