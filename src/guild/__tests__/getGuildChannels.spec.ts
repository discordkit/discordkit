import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildChannelsProcedure,
  getGuildChannelsQuery,
  getGuildChannelsSchema
} from "../getGuildChannels";
import { channelSchema } from "../../channel/types/Channel";

describe(`getGuildChannels`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/channels`,
    channelSchema.array()
  );
  const config = generateMock(getGuildChannelsSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildChannelsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildChannelsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
