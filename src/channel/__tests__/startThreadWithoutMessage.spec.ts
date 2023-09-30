import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  startThreadWithoutMessage,
  startThreadWithoutMessageProcedure,
  startThreadWithoutMessageSafe,
  startThreadWithoutMessageSchema
} from "../startThreadWithoutMessage";
import { channelSchema } from "../types/Channel";

describe(`startThreadWithoutMessage`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/threads`,
    channelSchema
  );
  const config = generateMock(startThreadWithoutMessageSchema);

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
