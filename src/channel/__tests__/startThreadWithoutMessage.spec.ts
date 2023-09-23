import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  startThreadWithoutMessage,
  startThreadWithoutMessageSchema
} from "../startThreadWithoutMessage";
import { channelSchema } from "../types/Channel";

describe(`startThreadWithoutMessage`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/threads`,
    channelSchema
  );
  const config = generateMock(startThreadWithoutMessageSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.startThreadWithoutMessage(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(startThreadWithoutMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
