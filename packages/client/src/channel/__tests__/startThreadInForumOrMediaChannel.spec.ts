import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  startThreadInForumOrMediaChannel,
  startThreadInForumOrMediaChannelProcedure,
  startThreadInForumOrMediaChannelSafe,
  startThreadInForumOrMediaChannelSchema
} from "../startThreadInForumOrMediaChannel.ts";
import { channelSchema } from "../types/Channel.ts";
import { messageSchema } from "../types/Message.ts";

describe(`startThreadInForumOrMediaChannel`, () => {
  mockRequest.post(
    `/channels/:channel/threads`,
    channelSchema.extend({ message: messageSchema })
  );
  const config = mockSchema(startThreadInForumOrMediaChannelSchema);

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
