import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  removeThreadMember,
  removeThreadMemberProcedure,
  removeThreadMemberSafe,
  removeThreadMemberSchema
} from "../removeThreadMember.js";

describe(`removeThreadMember`, () => {
  mockRequest.delete(`/channels/:channel/thread-members/:user`);
  const config = mockSchema(removeThreadMemberSchema);

  it(`can be used standalone`, async () => {
    await expect(removeThreadMemberSafe(config)).resolves.not.toThrow();
  });

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
