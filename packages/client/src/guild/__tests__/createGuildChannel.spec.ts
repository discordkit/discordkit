import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createGuildChannel,
  createGuildChannelProcedure,
  createGuildChannelSafe,
  createGuildChannelSchema
} from "../createGuildChannel.js";
import { channelSchema } from "../../channel/types/Channel.js";

describe(`createGuildChannel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/channels`,
    createGuildChannelSchema,
    channelSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createGuildChannelSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildChannelProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
