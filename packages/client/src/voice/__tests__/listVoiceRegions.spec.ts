import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import { array, length } from "valibot";
import {
  listVoiceRegionsProcedure,
  listVoiceRegionsQuery,
  listVoiceRegionsSafe
} from "../listVoiceRegions.js";
import { voiceRegionSchema } from "../types/VoiceRegion.js";

describe(`listVoiceRegions`, () => {
  const expected = mockRequest.get(
    `/voice/regions`,
    array(voiceRegionSchema, [length(1)])
  );

  it(`can be used standalone`, async () => {
    await expect(listVoiceRegionsSafe()).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(listVoiceRegionsProcedure)()).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listVoiceRegionsQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
