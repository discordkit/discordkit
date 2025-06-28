import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyChannel,
  modifyChannelProcedure,
  modifyChannelSafe,
  modifyChannelSchema
} from "../modifyChannel.js";
import { channelSchema } from "../types/Channel.js";

describe(`modifyChannel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/channels/:channel`,
    modifyChannelSchema,
    channelSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyChannelSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(modifyChannelProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
