import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGuildVoiceRegionsProcedure,
  getGuildVoiceRegionsQuery,
  getGuildVoiceRegionsSafe,
  getGuildVoiceRegionsSchema
} from "../getGuildVoiceRegions.js";
import { voiceRegionSchema } from "../../voice/types/VoiceRegion.js";

describe(`getGuildVoiceRegions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/regions`,
    getGuildVoiceRegionsSchema,
    voiceRegionSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildVoiceRegionsSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildVoiceRegionsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildVoiceRegionsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
