import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import { merge, object } from "valibot";
import {
  startThreadInForumOrMediaChannel,
  startThreadInForumOrMediaChannelProcedure,
  startThreadInForumOrMediaChannelSafe,
  startThreadInForumOrMediaChannelSchema
} from "../startThreadInForumOrMediaChannel.js";
import { channelSchema } from "../types/Channel.js";
import { messageSchema } from "../types/Message.js";

describe(`startThreadInForumOrMediaChannel`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/threads`,
    merge([channelSchema, object({ message: messageSchema })])
  );
  const config = mockSchema(startThreadInForumOrMediaChannelSchema);

  it(`can be used standalone`, async () => {
    await expect(startThreadInForumOrMediaChannelSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(startThreadInForumOrMediaChannelProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(startThreadInForumOrMediaChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
