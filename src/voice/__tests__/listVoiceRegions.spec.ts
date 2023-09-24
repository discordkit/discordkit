import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  listVoiceRegionsProcedure,
  listVoiceRegionsQuery
} from "../listVoiceRegions";
import { voiceRegionSchema } from "../types/VoiceRegion";

describe(`listVoiceRegions`, () => {
  const expected = mockRequest.get(`/voice/regions`, voiceRegionSchema.array());

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
