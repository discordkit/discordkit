import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getGuildVoiceRegionsQuery,
  getGuildVoiceRegionsSchema
} from "../getGuildVoiceRegions";
import { voiceRegionSchema } from "../../voice/types/VoiceRegion";

describe(`getGuildVoiceRegions`, () => {
  const expected = mockRequest.get(`/guilds/:guild/regions`, voiceRegionSchema);
  const config = generateMock(getGuildVoiceRegionsSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildVoiceRegions(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildVoiceRegionsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
