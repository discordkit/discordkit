import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { joinThread, joinThreadSchema } from "../joinThread";

describe(`joinThread`, () => {
  mockRequest.put(`/channels/:channel/thread-members/@me`);
  const config = generateMock(joinThreadSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.joinThread(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(joinThread);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
