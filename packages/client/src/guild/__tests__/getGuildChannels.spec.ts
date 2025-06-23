import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  getGuildChannelsProcedure,
  getGuildChannelsQuery,
  getGuildChannelsSafe,
  getGuildChannelsSchema
} from "../getGuildChannels.js";
import { channelSchema } from "../../channel/types/Channel.js";

describe(`getGuildChannels`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/channels`,
    pipe(array(channelSchema), length(1))
  );
  const config = mockSchema(getGuildChannelsSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildChannelsSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildChannelsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildChannelsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
