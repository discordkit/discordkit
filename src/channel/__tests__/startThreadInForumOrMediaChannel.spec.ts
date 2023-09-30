import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  startThreadInForumOrMediaChannel,
  startThreadInForumOrMediaChannelProcedure,
  startThreadInForumOrMediaChannelSafe,
  startThreadInForumOrMediaChannelSchema
} from "../startThreadInForumOrMediaChannel";
import { channelSchema } from "../types/Channel";
import { messageSchema } from "../types/Message";

describe(`startThreadInForumOrMediaChannel`, () => {
  mockRequest.post(
    `/channels/:channel/threads`,
    channelSchema.extend({ message: messageSchema })
  );
  const config = generateMock(startThreadInForumOrMediaChannelSchema);

  it(`can be used standalone`, async () => {
    await expect(
      startThreadInForumOrMediaChannelSafe(config)
    ).resolves.toBeDefined();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(startThreadInForumOrMediaChannelProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(startThreadInForumOrMediaChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
