import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  startThreadInForumOrMediaChannel,
  startThreadInForumOrMediaChannelProcedure,
  startThreadInForumOrMediaChannelSafe,
  startThreadInForumOrMediaChannelSchema,
  threadInForumOrMediaChannelResponseSchema
} from "../startThreadInForumOrMediaChannel.js";

describe(`startThreadInForumOrMediaChannel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/threads`,
    startThreadInForumOrMediaChannelSchema,
    threadInForumOrMediaChannelResponseSchema
  );

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
