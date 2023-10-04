import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  modifyChannel,
  modifyChannelProcedure,
  modifyChannelSafe,
  modifyChannelSchema
} from "../modifyChannel.js";
import { channelSchema } from "../types/Channel.js";

describe(`modifyChannel`, () => {
  const expected = mockRequest.patch(`/channels/:channel`, channelSchema);
  const config = mockSchema(modifyChannelSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyChannelSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyChannelProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
