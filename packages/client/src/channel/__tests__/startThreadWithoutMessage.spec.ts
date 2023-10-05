import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  startThreadWithoutMessage,
  startThreadWithoutMessageProcedure,
  startThreadWithoutMessageSafe,
  startThreadWithoutMessageSchema
} from "../startThreadWithoutMessage.js";
import { channelSchema } from "../types/Channel.js";

describe(`startThreadWithoutMessage`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/threads`,
    channelSchema
  );
  const config = mockSchema(startThreadWithoutMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(startThreadWithoutMessageSafe(config)).resolves.toBeDefined();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(startThreadWithoutMessageProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(startThreadWithoutMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
