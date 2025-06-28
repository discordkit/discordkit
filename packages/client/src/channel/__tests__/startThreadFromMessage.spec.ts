import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  startThreadFromMessage,
  startThreadFromMessageProcedure,
  startThreadFromMessageSafe,
  startThreadFromMessageSchema
} from "../startThreadFromMessage.js";
import { channelSchema } from "../types/Channel.js";

describe(`startThreadFromMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/messages/:message/threads`,
    startThreadFromMessageSchema,
    channelSchema
  );

  it(`can be used standalone`, async () => {
    await expect(startThreadFromMessageSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(startThreadFromMessageProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(startThreadFromMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
