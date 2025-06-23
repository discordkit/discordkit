import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  addThreadMember,
  addThreadMemberProcedure,
  addThreadMemberSafe,
  addThreadMemberSchema
} from "../addThreadMember.js";

describe(`addThreadMember`, () => {
  mockRequest.put(`/channels/:channel/thread-members/:user`);
  const config = mockSchema(addThreadMemberSchema);

  it(`can be used standalone`, async () => {
    await expect(addThreadMemberSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(addThreadMemberProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(addThreadMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
