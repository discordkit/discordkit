import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  listVoiceRegionsProcedure,
  listVoiceRegionsQuery,
  listVoiceRegionsSafe
} from "../listVoiceRegions.ts";
import { voiceRegionSchema } from "../types/VoiceRegion.ts";

describe(`listVoiceRegions`, () => {
  it(`can be used standalone`, async () => {
    const expected = mockRequest.get(
      `/voice/regions`,
      voiceRegionSchema.array().length(1)
    );
    await expect(listVoiceRegionsSafe()).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    const expected = mockRequest.get(
      `/voice/regions`,
      voiceRegionSchema.array().length(1)
    );
    await expect(
      runProcedure(listVoiceRegionsProcedure)()
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const expected = mockRequest.get(
      `/voice/regions`,
      voiceRegionSchema.array().length(1)
    );
    const { result } = runQuery(listVoiceRegionsQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
