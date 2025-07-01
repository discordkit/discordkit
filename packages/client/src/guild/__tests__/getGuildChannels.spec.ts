import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { channelSchema } from "../../channel/types/Channel.js";
import {
  getGuildChannelsProcedure,
  getGuildChannelsQuery,
  getGuildChannelsSafe,
  getGuildChannelsSchema
} from "../getGuildChannels.js";

describe(`getGuildChannels`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/channels`,
    getGuildChannelsSchema,
    v.pipe(v.array(channelSchema), v.length(1))
  );

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
