import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  listVoiceRegionsProcedure,
  listVoiceRegionsQuery,
  listVoiceRegionsSafe
} from "../listVoiceRegions.js";
import { voiceRegionSchema } from "../types/VoiceRegion.js";

describe(`listVoiceRegions`, () => {
  const expected = mockRequest.get(
    `/voice/regions`,
    voiceRegionSchema.array().length(1)
  );

  it(`can be used standalone`, async () => {
    await expect(listVoiceRegionsSafe()).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listVoiceRegionsProcedure)()
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listVoiceRegionsQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
