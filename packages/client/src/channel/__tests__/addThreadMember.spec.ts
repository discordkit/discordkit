import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  addThreadMember,
  addThreadMemberProcedure,
  addThreadMemberSafe,
  addThreadMemberSchema
} from "../addThreadMember.js";

describe(`addThreadMember`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/channels/:channel/thread-members/:user`,
    addThreadMemberSchema
  );

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
