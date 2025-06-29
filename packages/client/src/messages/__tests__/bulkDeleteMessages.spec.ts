import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  bulkDeleteMessages,
  bulkDeleteMessagesProcedure,
  bulkDeleteMessagesSafe,
  bulkDeleteMessagesSchema
} from "../bulkDeleteMessages.js";

describe(`bulkDeleteMessages`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/channels/:channel/messages/bulk-delete`,
    bulkDeleteMessagesSchema
  );

  it(`can be used standalone`, async () => {
    await expect(bulkDeleteMessagesSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(bulkDeleteMessagesProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(bulkDeleteMessages);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
