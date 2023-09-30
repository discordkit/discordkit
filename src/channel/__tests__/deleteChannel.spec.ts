import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteChannel,
  deleteChannelProcedure,
  deleteChannelSafe,
  deleteChannelSchema
} from "../deleteChannel";
import { channelSchema } from "../types/Channel";

describe(`deleteChannel`, () => {
  const expected = mockRequest.delete(`/channels/:channel`, channelSchema);
  const config = generateMock(deleteChannelSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteChannelSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteChannelProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result).toBeDefined();
  });
});
