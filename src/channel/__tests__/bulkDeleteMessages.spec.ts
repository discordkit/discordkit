import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  bulkDeleteMessages,
  bulkDeleteMessagesProcedure,
  bulkDeleteMessagesSafe,
  bulkDeleteMessagesSchema
} from "../bulkDeleteMessages";

describe(`bulkDeleteMessages`, () => {
  mockRequest.post(`/channels/:channel/messages/bulk-delete`);
  const config = generateMock(bulkDeleteMessagesSchema);

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
