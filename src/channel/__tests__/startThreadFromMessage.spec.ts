import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  startThreadFromMessage,
  startThreadFromMessageSchema
} from "../startThreadFromMessage";
import { channelSchema } from "../types/Channel";

describe(`startThreadFromMessage`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/messages/:message/threads`,
    channelSchema
  );
  const config = generateMock(startThreadFromMessageSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.startThreadFromMessage(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(startThreadFromMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
