import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { pinMessage, pinMessageSchema } from "../pinMessage";

describe(`pinMessage`, () => {
  mockRequest.put(`/channels/:channel/pins/:message`);
  const config = generateMock(pinMessageSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.pinMessage(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(pinMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
