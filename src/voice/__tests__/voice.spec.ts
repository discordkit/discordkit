import { mockRequest } from "../../../jest.setup";
import { client } from "../__fixtures__/router";
import { voiceRegionSchema } from "../types";

describe(`voice`, () => {
  it(`listVoiceRegions`, async () => {
    const result = mockRequest.get(`/voice/regions`, voiceRegionSchema.array());
    const actual = await client.listVoiceRegions();
    expect(actual).toStrictEqual(result);
  });
});
