import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  groupDMRemoveRecipient,
  groupDMRemoveRecipientProcedure,
  groupDMRemoveRecipientSafe,
  groupDMRemoveRecipientSchema
} from "../groupDMRemoveRecipient.js";

describe(`groupDMRemoveRecipient`, () => {
  mockRequest.delete(`/channels/:channel/recipients/:user`);
  const config = mockSchema(groupDMRemoveRecipientSchema);

  it(`can be used standalone`, async () => {
    await expect(groupDMRemoveRecipientSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(groupDMRemoveRecipientProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(groupDMRemoveRecipient);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
