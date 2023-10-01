import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getGuildChannelsProcedure,
  getGuildChannelsQuery,
  getGuildChannelsSafe,
  getGuildChannelsSchema
} from "../getGuildChannels.ts";
import { channelSchema } from "../../channel/types/Channel.ts";

describe(`getGuildChannels`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/channels`,
    channelSchema.array().length(1)
  );
  const config = generateMock(getGuildChannelsSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildChannelsSafe(config)).resolves.toStrictEqual(expected);
  });

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
