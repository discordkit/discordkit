import { waitFor } from "@testing-library/react";
import { mockRequest, mockQuery } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { voiceRegionSchema } from "../types";
import { listVoiceRegionsQuery } from "../listVoiceRegions";

describe(`listVoiceRegions`, () => {
  const expected = mockRequest.get(`/voice/regions`, voiceRegionSchema.array());

  it(`is tRPC compatible`, async () => {
    const actual = await client.listVoiceRegions();
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(listVoiceRegionsQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
