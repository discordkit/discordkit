import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { addThreadMember, addThreadMemberSchema } from "../addThreadMember";

describe(`addThreadMember`, () => {
  mockRequest.put(`/channels/:channel/thread-members/:user`);
  const config = generateMock(addThreadMemberSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.addThreadMember(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(addThreadMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
