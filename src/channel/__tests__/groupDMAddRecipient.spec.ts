import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  groupDMAddRecipient,
  groupDMAddRecipientProcedure,
  groupDMAddRecipientSchema
} from "../groupDMAddRecipient";

describe(`groupDMAddRecipient`, () => {
  mockRequest.put(`/channels/:channel/recipients/:user`);
  const config = generateMock(groupDMAddRecipientSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(groupDMAddRecipientProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(groupDMAddRecipient);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
