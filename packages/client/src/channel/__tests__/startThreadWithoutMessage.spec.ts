import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  startThreadWithoutMessage,
  startThreadWithoutMessageProcedure,
  startThreadWithoutMessageSafe,
  startThreadWithoutMessageSchema
} from "../startThreadWithoutMessage.js";
import { channelSchema } from "../types/Channel.js";

describe(`startThreadWithoutMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/threads`,
    startThreadWithoutMessageSchema,
    channelSchema
  );

  it(`can be used standalone`, async () => {
    await expect(startThreadWithoutMessageSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(startThreadWithoutMessageProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(startThreadWithoutMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
