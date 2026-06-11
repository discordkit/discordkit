import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { voiceRegionSchema } from "../types/VoiceRegion.js";
import { listVoiceRegions } from "../listVoiceRegions.js";

describe(`listVoiceRegions`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/voice/regions`,
    null,
    v.pipe(v.array(voiceRegionSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listVoiceRegions,
        null,
        v.pipe(v.array(voiceRegionSchema), v.length(1))
      )()
    ).resolves.toEqual(expected);
  });
});
