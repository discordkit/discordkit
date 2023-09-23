import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  groupDMRemoveRecipient,
  groupDMRemoveRecipientSchema
} from "../groupDMRemoveRecipient";

describe(`groupDMRemoveRecipient`, () => {
  mockRequest.delete(`/channels/:channel/recipients/:user`);
  const config = generateMock(groupDMRemoveRecipientSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.groupDMRemoveRecipient(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(groupDMRemoveRecipient);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
