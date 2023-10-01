import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createGuildChannel,
  createGuildChannelProcedure,
  createGuildChannelSafe,
  createGuildChannelSchema
} from "../createGuildChannel.ts";
import { channelSchema } from "../../channel/types/Channel.ts";

describe(`createGuildChannel`, () => {
  const expected = mockRequest.post(`/guilds/:guild/channels`, channelSchema);
  const config = mockSchema(createGuildChannelSchema);

  it(`can be used standalone`, async () => {
    await expect(createGuildChannelSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildChannelProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
