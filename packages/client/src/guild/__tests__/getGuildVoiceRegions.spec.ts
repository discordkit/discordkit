import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildVoiceRegionsProcedure,
  getGuildVoiceRegionsQuery,
  getGuildVoiceRegionsSafe,
  getGuildVoiceRegionsSchema
} from "../getGuildVoiceRegions.js";
import { voiceRegionSchema } from "../../voice/types/VoiceRegion.js";

describe(`getGuildVoiceRegions`, () => {
  const expected = mockRequest.get(`/guilds/:guild/regions`, voiceRegionSchema);
  const config = mockSchema(getGuildVoiceRegionsSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildVoiceRegionsSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildVoiceRegionsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildVoiceRegionsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
