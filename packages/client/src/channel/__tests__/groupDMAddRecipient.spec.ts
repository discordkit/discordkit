import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  groupDMAddRecipient,
  groupDMAddRecipientProcedure,
  groupDMAddRecipientSafe,
  groupDMAddRecipientSchema
} from "../groupDMAddRecipient.js";

describe(`groupDMAddRecipient`, () => {
  mockRequest.put(`/channels/:channel/recipients/:user`);
  const config = mockSchema(groupDMAddRecipientSchema);

  it(`can be used standalone`, async () => {
    await expect(groupDMAddRecipientSafe(config)).resolves.not.toThrow();
  });

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
