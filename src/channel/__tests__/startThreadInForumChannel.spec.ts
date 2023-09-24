import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  startThreadInForumChannel,
  startThreadInForumChannelProcedure,
  startThreadInForumChannelSchema
} from "../startThreadInForumChannel";
import { channelSchema } from "../types/Channel";

describe(`startThreadInForumChannel`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/threads`,
    channelSchema
  );
  const config = generateMock(startThreadInForumChannelSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(startThreadInForumChannelProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(startThreadInForumChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
