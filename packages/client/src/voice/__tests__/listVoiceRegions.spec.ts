import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { voiceRegionSchema } from "../types/VoiceRegion.js";
import {
  listVoiceRegionsProcedure,
  listVoiceRegionsQuery,
  listVoiceRegionsSafe
} from "../listVoiceRegions.js";

describe(`listVoiceRegions`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/voice/regions`,
    null,
    v.pipe(v.array(voiceRegionSchema), v.length(1))
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
