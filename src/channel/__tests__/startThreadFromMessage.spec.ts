import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  startThreadFromMessage,
  startThreadFromMessageProcedure,
  startThreadFromMessageSafe,
  startThreadFromMessageSchema
} from "../startThreadFromMessage";
import { channelSchema } from "../types/Channel";

describe(`startThreadFromMessage`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/messages/:message/threads`,
    channelSchema
  );
  const config = generateMock(startThreadFromMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(startThreadFromMessageSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(startThreadFromMessageProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(startThreadFromMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
