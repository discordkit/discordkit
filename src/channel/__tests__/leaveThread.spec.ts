import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { leaveThread, leaveThreadSchema } from "../leaveThread";

describe(`leaveThread`, () => {
  mockRequest.delete(`/channels/:channel/thread-members/@me`);
  const config = generateMock(leaveThreadSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.joinThread(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(leaveThread);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
