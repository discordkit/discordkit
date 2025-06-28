import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  listVoiceRegionsProcedure,
  listVoiceRegionsQuery,
  listVoiceRegionsSafe
} from "../listVoiceRegions.js";
import { voiceRegionSchema } from "../types/VoiceRegion.js";

describe(`listVoiceRegions`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/voice/regions`,
    null,
    pipe(array(voiceRegionSchema), length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(listVoiceRegionsSafe()).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listVoiceRegionsProcedure)(null)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listVoiceRegionsQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
