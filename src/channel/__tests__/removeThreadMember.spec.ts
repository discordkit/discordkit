import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  removeThreadMember,
  removeThreadMemberProcedure,
  removeThreadMemberSchema
} from "../removeThreadMember";

describe(`removeThreadMember`, () => {
  mockRequest.delete(`/channels/:channel/thread-members/:user`);
  const config = generateMock(removeThreadMemberSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(removeThreadMemberProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(removeThreadMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
