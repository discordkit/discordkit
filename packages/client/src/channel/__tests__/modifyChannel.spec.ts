import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  modifyChannel,
  modifyChannelProcedure,
  modifyChannelSafe,
  modifyChannelSchema
} from "../modifyChannel.ts";
import { channelSchema } from "../types/Channel.ts";

describe(`modifyChannel`, () => {
  const expected = mockRequest.patch(`/channels/:channel`, channelSchema);
  const config = generateMock(modifyChannelSchema);

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
