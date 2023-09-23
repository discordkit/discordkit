import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  removeThreadMember,
  removeThreadMemberSchema
} from "../removeThreadMember";

describe(`removeThreadMember`, () => {
  mockRequest.delete(`/channels/:channel/thread-members/:user`);
  const config = generateMock(removeThreadMemberSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.removeThreadMember(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(removeThreadMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
